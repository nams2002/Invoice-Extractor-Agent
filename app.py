import os
import streamlit as st
from openai import OpenAI
import json
import speech_recognition as sr
import fitz  # PyMuPDF
from pathlib import Path
import pandas as pd

# ----------- SET ENV ---------- #
if "STREAMLIT_SHARED_SECRET" in os.environ:
    os.environ["STREAMLIT_ENV"] = "cloud"
else:
    os.environ["STREAMLIT_ENV"] = "local"

# ----------- SET API KEY ---------- #
def initialize_openai_client():
    """Initialize OpenAI client with proper error handling"""
    api_key = None
    
    # Try multiple sources for API key
    try:
        # First try Streamlit secrets
        if hasattr(st, 'secrets') and 'openai_api_key' in st.secrets:
            api_key = st.secrets["openai_api_key"]
    except Exception:
        pass
    
    if not api_key:
        try:
            # Try environment variable
            api_key = os.environ.get("OPENAI_API_KEY")
        except Exception:
            pass
    
    if not api_key:
        # Show input field for API key
        st.error("⚠️ OpenAI API key not found!")
        st.markdown("Please provide your OpenAI API key in one of these ways:")
        st.markdown("1. Set `OPENAI_API_KEY` environment variable")
        st.markdown("2. Add `openai_api_key` to Streamlit secrets")
        st.markdown("3. Enter it below temporarily:")
        
        api_key = st.text_input("Enter OpenAI API Key:", type="password", help="Your API key will not be stored")
        
        if not api_key:
            st.warning("Please enter your OpenAI API key to continue.")
            st.stop()
    
    try:
        # Initialize client with minimal parameters
        client = OpenAI(api_key=api_key)
        
        # Test the client with a simple request
        try:
            models = client.models.list()
            st.success("✅ OpenAI client initialized successfully!")
            return client
        except Exception as test_error:
            st.error(f"❌ API key test failed: {str(test_error)}")
            st.markdown("Please check that your API key is valid and has the necessary permissions.")
            st.stop()
            
    except Exception as e:
        st.error(f"❌ Error initializing OpenAI client: {str(e)}")
        st.markdown("**Troubleshooting tips:**")
        st.markdown("- Ensure your API key starts with 'sk-'")
        st.markdown("- Check that your API key is active and has credits")
        st.markdown("- Try updating the OpenAI library: `pip install openai --upgrade`")
        st.stop()

# Initialize client (with session state to avoid re-initialization)
if 'openai_client' not in st.session_state:
    st.session_state.openai_client = initialize_openai_client()

client = st.session_state.openai_client

# ----------- PDF UTILS ------------ #
def extract_basic_fields(text):
    """Fallback method to extract basic fields without AI"""
    import re
    
    # Basic patterns to look for
    patterns = {
        'amount_due': [
            r'amount\s*due[:\s]*\$?([0-9,]+\.?[0-9]*)',
            r'total\s*amount[:\s]*\$?([0-9,]+\.?[0-9]*)',
            r'balance[:\s]*\$?([0-9,]+\.?[0-9]*)',
            r'\$([0-9,]+\.?[0-9]*)'
        ],
        'due_date': [
            r'due\s*date[:\s]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})',
            r'payment\s*due[:\s]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})',
            r'([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})'
        ],
        'account_number': [
            r'account\s*number[:\s]*([0-9-]+)',
            r'account[:\s]*([0-9-]+)',
            r'acct[:\s]*([0-9-]+)'
        ]
    }
    
    result = {
        "biller_name": None,
        "account_number": None,
        "due_date": None,
        "amount_due": None,
        "billing_period": None,
        "service_description": None,
        "status": "unpaid",
        "raw_text": text
    }
    
    text_lower = text.lower()
    
    # Extract fields using regex
    for field, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text_lower)
            if match:
                result[field] = match.group(1).strip()
                break
    
    # Try to extract biller name (usually at the top)
    lines = text.split('\n')[:5]  # Look in first 5 lines
    for line in lines:
        if len(line.strip()) > 5 and not any(char.isdigit() for char in line):
            result['biller_name'] = line.strip()
            break
    
    return result

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {e}"

def extract_structured_fields(text):
    """Extract structured data from invoice text using OpenAI"""
    if not client:
        st.error("OpenAI client not available. Please check your API key.")
        return {
            "biller_name": None,
            "account_number": None,
            "due_date": None,
            "amount_due": None,
            "billing_period": None,
            "service_description": None,
            "status": None,
            "raw_text": text,
            "error": "OpenAI client not initialized"
        }
    
    prompt = f"""
    Extract the following fields from the invoice below as JSON:
    - biller_name
    - account_number
    - due_date
    - amount_due
    - billing_period
    - service_description
    - status (paid/unpaid)

    Only use values present in the invoice content. If a value is not found, return it as null.
    Return only valid JSON without any additional text.

    Invoice:
    {text}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using more stable model
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=500
        )
        json_text = response.choices[0].message.content.strip()
        
        # Clean up the response to ensure it's valid JSON
        if json_text.startswith('```json'):
            json_text = json_text[7:-3]
        elif json_text.startswith('```'):
            json_text = json_text[3:-3]
        
        parsed_data = json.loads(json_text)
        
        # Ensure all required fields exist
        required_fields = ["biller_name", "account_number", "due_date", "amount_due", "billing_period", "service_description", "status"]
        for key in required_fields:
            parsed_data.setdefault(key, None)
        
        parsed_data['raw_text'] = text
        return parsed_data
    except Exception as e:
        st.warning(f"AI extraction failed: {str(e)}")
        # Return basic extracted data manually
        return extract_basic_fields(text)

# ----------- VOICE ------------ #
def speak(text):
    """Text-to-speech functionality"""
    if os.environ.get("STREAMLIT_ENV") == "cloud":
        return
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        st.warning(f"Text-to-speech not available: {e}")

def listen_to_voice():
    """Voice input functionality"""
    if os.environ.get("STREAMLIT_ENV") == "cloud":
        st.warning("🎤 Voice input is not supported on Streamlit Cloud.")
        return ""

    try:
        import pyaudio
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            st.info("Listening... 🎙️")
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source, timeout=5)
            try:
                text = recognizer.recognize_google(audio)
                st.success(f"You said: {text}")
                return text
            except sr.UnknownValueError:
                st.warning("Sorry, I didn't catch that.")
                return ""
            except sr.RequestError as e:
                st.error(f"Could not request results from Google Speech Recognition service; {e}")
                return ""
    except ImportError:
        st.warning("PyAudio is not installed. Please install it locally to use voice input.")
        return ""
    except Exception as e:
        st.error(f"Voice input error: {e}")
        return ""

# ----------- LLM ------------- #
def ask_agentic_ai(prompt, bill):
    """Ask AI assistant about the bill"""
    if not client:
        return "I'm sorry, but the AI assistant is not available right now. Please check the bill details manually."
    
    try:
        context_fields = {k: v for k, v in bill.items() if k != 'raw_text'}
        context_json = json.dumps(context_fields, indent=2)
        
        messages = [
            {"role": "system", "content": f"You are a helpful billing assistant. This is the structured data from the user's bill:\n{context_json}"},
            {"role": "user", "content": prompt}
        ]
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using more stable model
            messages=messages,
            max_tokens=250,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        # Fallback to basic responses
        return get_basic_response(prompt, bill)

# ----------- ACTIONS --------- #
def get_basic_response(prompt, bill):
    """Fallback responses when AI is not available"""
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ["amount", "cost", "price", "due", "owe"]):
        amount = bill.get('amount_due', 'not found')
        return f"According to the bill, the amount due is: ${amount}"
    
    elif any(word in prompt_lower for word in ["date", "when", "due date"]):
        due_date = bill.get('due_date', 'not found')
        return f"The due date for this bill is: {due_date}"
    
    elif any(word in prompt_lower for word in ["account", "number"]):
        account = bill.get('account_number', 'not found')
        return f"Your account number is: {account}"
    
    elif any(word in prompt_lower for word in ["biller", "company", "provider"]):
        biller = bill.get('biller_name', 'not found')
        return f"This bill is from: {biller}"
    
    elif any(word in prompt_lower for word in ["status", "paid", "unpaid"]):
        status = bill.get('status', 'not found')
        return f"The status of this bill is: {status}"
    
    else:
        return "I can help you with information about your bill amount, due date, account number, biller name, or payment status. Please ask a specific question."

def handle_action(command, bill):
    """Handle specific actions based on user commands"""
    command_lower = command.lower()
    
    if any(word in command_lower for word in ["pay", "payment", "make payment"]):
        amount = bill.get('amount_due', 'unknown')
        biller = bill.get('biller_name', 'your biller')
        return f"🔄 Initiating secure payment of ${amount} to {biller}. Please confirm this action."
    elif any(word in command_lower for word in ["change address", "update address", "billing address"]):
        return "📮 Please provide your new billing address. I'll forward it to the billing team."
    elif any(word in command_lower for word in ["complaint", "dispute", "issue", "problem"]):
        return "📝 A complaint has been raised with your service provider. You should receive a response within 24-48 hours."
    elif any(word in command_lower for word in ["due date", "when due", "deadline"]):
        due_date = bill.get('due_date', 'unknown')
        return f"📅 Your bill is due on: {due_date}"
    elif any(word in command_lower for word in ["balance", "amount", "total"]):
        amount = bill.get('amount_due', 'unknown')
        return f"💰 Your current amount due is: ${amount}"
    
    return None

# ----------- CLEANUP ----------- #
def cleanup_temp_files():
    """Clean up temporary files"""
    temp_files = [f for f in os.listdir('.') if f.startswith('temp_') and f.endswith('.pdf')]
    for file in temp_files:
        try:
            os.remove(file)
        except:
            pass

# ----------- UI Starts Here ----------- #
st.set_page_config(page_title="Agentic AI Bill Assistant", page_icon="🤖", layout="wide")
st.title("🤖 Agentic AI Billing Assistant")
st.markdown("Talk to your bill — ask questions, get clarity, and resolve actions.")

# Check if we have a working OpenAI client
if 'openai_client' not in st.session_state:
    st.info("🔑 Setting up AI assistant...")
    try:
        st.session_state.openai_client = initialize_openai_client()
    except Exception as e:
        st.error(f"Failed to initialize AI: {str(e)}")
        st.session_state.openai_client = None

client = st.session_state.openai_client

# Show status
if client:
    st.success("✅ AI assistant is ready!")
else:
    st.warning("⚠️ AI assistant is not available. Basic functionality will still work.")

# File uploader
uploaded_files = st.file_uploader(
    "📄 Upload PDF bills", 
    accept_multiple_files=True, 
    type=["pdf"],
    help="Upload one or more PDF bills to analyze"
)

bill_data_collection = []

if uploaded_files:
    progress_bar = st.progress(0)
    
    for i, uploaded_file in enumerate(uploaded_files):
        progress_bar.progress((i + 1) / len(uploaded_files))
        
        # Save uploaded file temporarily
        temp_filename = f"temp_{uploaded_file.name}"
        with open(temp_filename, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        # Extract text and structured data
        with st.spinner(f"Processing {uploaded_file.name}..."):
            text = extract_text_from_pdf(temp_filename)
            bill_data = extract_structured_fields(text)
            bill_data['filename'] = uploaded_file.name
            bill_data_collection.append(bill_data)
        
        # Clean up temp file
        try:
            os.remove(temp_filename)
        except:
            pass
    
    progress_bar.empty()
    st.success(f"✅ Processed {len(uploaded_files)} bill(s)")

# Bill selection
selected_bill_index = 0
if len(bill_data_collection) > 1:
    bill_options = [f"{i+1}. {bill.get('biller_name', 'Unknown')} - {bill.get('filename', 'Unknown')}" 
                   for i, bill in enumerate(bill_data_collection)]
    selected_option = st.selectbox("Select Bill to Interact With:", bill_options)
    selected_bill_index = int(selected_option.split('.')[0]) - 1

if bill_data_collection:
    bill_data = bill_data_collection[selected_bill_index]
    
    # Display bill information
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📋 Bill Summary")
        if bill_data.get('biller_name'):
            st.write(f"**Biller:** {bill_data['biller_name']}")
        if bill_data.get('amount_due'):
            st.write(f"**Amount Due:** ${bill_data['amount_due']}")
        if bill_data.get('due_date'):
            st.write(f"**Due Date:** {bill_data['due_date']}")
        if bill_data.get('status'):
            status_color = "green" if bill_data['status'] == 'paid' else "red"
            st.write(f"**Status:** :{status_color}[{bill_data['status'].upper()}]")
    
    with col2:
        st.subheader("🔧 Quick Actions")
        if st.button("💳 Pay Bill", type="primary"):
            if bill_data.get("status") != "paid":
                st.success(f"✅ Payment of ${bill_data.get('amount_due', 'N/A')} to {bill_data.get('biller_name', 'N/A')} initiated!")
                speak(f"Payment of ${bill_data.get('amount_due')} to {bill_data.get('biller_name')} initiated!")
            else:
                st.info("ℹ️ This bill is already marked as paid.")
        
        if st.button("📮 Change Address"):
            st.info("Address change request submitted. You'll receive confirmation via email.")
        
        if st.button("📝 File Complaint"):
            st.info("Complaint filed successfully. Reference ID: #" + str(hash(bill_data.get('account_number', 'default')))[-6:])

    # Detailed information in expandable sections
    with st.expander("📑 Complete Bill Details"):
        details = {k: v for k, v in bill_data.items() if k not in ['raw_text', 'filename']}
        st.json(details)

    with st.expander("🔍 Raw Invoice Text"):
        st.text_area("Raw Text:", value=bill_data.get('raw_text', ''), height=300, disabled=True)

    # Multi-bill comparison
    if len(bill_data_collection) > 1:
        st.subheader("📊 Bill Comparison")
        
        # Create comparison dataframe
        comparison_data = []
        for bill in bill_data_collection:
            try:
                amount = float(bill.get('amount_due', 0) or 0)
            except:
                amount = 0
            
            comparison_data.append({
                'Biller': bill.get('biller_name', 'Unknown'),
                'Amount Due': amount,
                'Due Date': bill.get('due_date', 'N/A'),
                'Status': bill.get('status', 'N/A'),
                'Period': bill.get('billing_period', 'N/A')
            })
        
        df = pd.DataFrame(comparison_data)
        
        # Display chart
        if not df.empty and df['Amount Due'].sum() > 0:
            st.bar_chart(df.set_index('Biller')['Amount Due'])
        
        # Display table
        st.dataframe(df, use_container_width=True)

    # Chat interface
    st.subheader("💬 Chat with Your Bill")
    
    # Input methods
    col1, col2 = st.columns([3, 1])
    
    with col1:
        query = st.text_input("Ask a question or request an action:", placeholder="e.g., When is this bill due? or Pay this bill")
    
    with col2:
        use_voice = st.button("🎤 Voice Input") if os.environ.get("STREAMLIT_ENV") != "cloud" else False

    if use_voice:
        query = listen_to_voice()

    if query:
        with st.spinner("🤔 Processing your request..."):
            # First check if it's a specific action
            action_response = handle_action(query, bill_data)
            
            if action_response:
                st.success(action_response)
                speak(action_response)
            else:
                # Use AI for general questions
                ai_response = ask_agentic_ai(query, bill_data)
                st.info(ai_response)
                speak(ai_response)

    # Sample questions
    st.subheader("❓ Try These Questions:")
    sample_questions = [
        "What is my account number?",
        "When is this bill due?",
        "How much do I owe?",
        "What services am I being charged for?",
        "Is this bill paid or unpaid?",
        "Pay this bill",
        "File a complaint"
    ]
    
    cols = st.columns(3)
    for i, question in enumerate(sample_questions):
        with cols[i % 3]:
            if st.button(question, key=f"sample_{i}"):
                action_response = handle_action(question, bill_data)
                if action_response:
                    st.success(action_response)
                    speak(action_response)
                else:
                    ai_response = ask_agentic_ai(question, bill_data)
                    st.info(ai_response)
                    speak(ai_response)

else:
    st.info("👆 Please upload at least one PDF bill to get started.")
    st.markdown("""
    ### How to use:
    1. **Upload** your PDF bills using the file uploader above
    2. **Review** the extracted information
    3. **Ask questions** about your bills in natural language
    4. **Take actions** like paying bills or filing complaints
    """)

# Footer
st.markdown("---")
st.caption("🔒 Secured by Paymentus Patent | Built with 💡 using Streamlit, PyMuPDF, and OpenAI")

# Cleanup on exit
cleanup_temp_files()