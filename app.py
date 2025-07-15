import os
# Detect if running on Streamlit Cloud
if "STREAMLIT_SHARED_SECRET" in os.environ:
    os.environ["STREAMLIT_ENV"] = "cloud"
else:
    os.environ["STREAMLIT_ENV"] = "local"

import streamlit as st
import openai
import json
import speech_recognition as sr
import fitz  # PyMuPDF
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd

# ----------- CONFIG ---------- #
openai.api_key = st.secrets["openai_api_key"]

# ----------- PDF UTILS ------------ #
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {e}"

def extract_structured_fields(text):
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

    Invoice:
    {text}
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=500
        )
        json_text = response.choices[0].message.content
        parsed_data = json.loads(json_text)

        for key in ["biller_name", "account_number", "due_date", "amount_due", "billing_period", "service_description", "status"]:
            parsed_data.setdefault(key, None)

        parsed_data['raw_text'] = text
        return parsed_data
    except Exception as e:
        return {"raw_text": text, "error": str(e)}

# ----------- VOICE ------------ #
def speak(text):
    if os.environ.get("STREAMLIT_ENV") == "cloud":
        return
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except:
        pass

def listen_to_voice():
    if os.environ.get("STREAMLIT_ENV") == "cloud":
        st.warning("🎤 Voice input is not supported on Streamlit Cloud.")
        return ""

    try:
        import pyaudio
    except ImportError:
        st.warning("PyAudio is not installed. Please install it locally to use voice input.")
        return ""

    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        st.info("Listening... 🎙️")
        audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(audio)
            st.success(f"You said: {text}")
            return text
        except sr.UnknownValueError:
            st.warning("Sorry, I didn't catch that.")
            return ""

# ----------- LLM ------------- #
def ask_agentic_ai(prompt, bill):
    context_fields = {k: v for k, v in bill.items() if k != 'raw_text'}
    context_json = json.dumps(context_fields, indent=2)
    messages = [
        {"role": "system", "content": f"You are a helpful billing assistant. This is the structured data from the user's bill:\n{context_json}"},
        {"role": "user", "content": prompt}
    ]

    response = openai.chat.completions.create(
        model="gpt-4",
        messages=messages,
        max_tokens=250
    )
    return response.choices[0].message.content

# ----------- ACTIONS --------- #
def handle_action(command, bill):
    if "pay" in command.lower():
        return f"Initiating secure payment of ${bill.get('amount_due', 'unknown')} to {bill.get('biller_name', 'your biller')}."
    elif "change address" in command.lower():
        return "Please provide your new billing address. I’ll forward it to the billing team."
    elif "file complaint" in command.lower():
        return "A complaint has been raised with your service provider."
    return None

# ----------- UI Starts Here ----------- #
st.set_page_config(page_title="Agentic AI Bill Assistant", page_icon="🤖")
st.title("🤖 Agentic AI Billing Assistant")
st.markdown("Talk to your bill — ask questions, get clarity, and resolve actions.")

uploaded_files = st.file_uploader("📄 Upload a PDF bill or multiple PDFs", accept_multiple_files=True, type=["pdf"])
bill_data_collection = []

if uploaded_files:
    for uploaded_file in uploaded_files:
        with open(f"temp_{uploaded_file.name}", "wb") as f:
            f.write(uploaded_file.getbuffer())
        text = extract_text_from_pdf(f"temp_{uploaded_file.name}")
        bill_data = extract_structured_fields(text)
        bill_data_collection.append(bill_data)

selected_bill_index = 0
if len(bill_data_collection) > 1:
    selected_bill_index = st.selectbox("Select Bill to Interact With", list(range(len(bill_data_collection))))

if bill_data_collection:
    bill_data = bill_data_collection[selected_bill_index]
    with st.expander("📑 Extracted Invoice Details"):
        st.json({k: v for k, v in bill_data.items() if k != 'raw_text'})

    with st.expander("🔍 View Raw Invoice Text"):
        st.text(bill_data['raw_text'])

    if st.button("💳 Confirm Payment"):
        if bill_data.get("status") == "unpaid":
            st.success(f"✅ Payment of ${bill_data.get('amount_due')} to {bill_data.get('biller_name')} confirmed!")
            speak(f"Payment of ${bill_data.get('amount_due')} to {bill_data.get('biller_name')} confirmed!")
        else:
            st.info("This bill is already marked as paid.")

    if len(bill_data_collection) > 1:
        df = pd.DataFrame([{**b, 'amount_due': float(b.get('amount_due', 0) or 0)} for b in bill_data_collection])
        if 'biller_name' in df.columns and 'billing_period' in df.columns:
            df['label'] = df['biller_name'].fillna('Bill') + ' - ' + df['billing_period'].fillna('N/A')
            st.subheader("📊 Bill Amount Comparison")
            st.bar_chart(df.set_index('label')['amount_due'])
        else:
            st.warning("Some invoice data is incomplete — skipping chart display.")

    col1, col2 = st.columns(2)
    with col1:
        text_input = st.text_input("💬 Type your question or action")
    with col2:
        use_voice = False
        if os.environ.get("STREAMLIT_ENV") != "cloud":
            use_voice = st.button("🎤 Use Voice Input")

    if use_voice:
        query = listen_to_voice()
    else:
        query = text_input

    if query:
        with st.spinner("Processing your request with AI..."):
            action_response = handle_action(query, bill_data)
            if action_response:
                st.success(action_response)
                speak(action_response)
            else:
                ai_response = ask_agentic_ai(query, bill_data)
                st.success(ai_response)
                speak(ai_response)
else:
    st.warning("Please upload at least one PDF to get started.")

st.markdown("---")
st.caption("Secured by Paymentus Patent | Built with 💡 using Streamlit, PyMuPDF, and OpenAI")
