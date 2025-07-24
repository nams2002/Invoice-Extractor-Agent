const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Store for conversation context
const conversationStore = new Map();

// Enhanced LLM system prompt for generic AI assistant
const SYSTEM_PROMPT = `You are an advanced AI assistant specializing in billing, payments, and general knowledge queries. You can:

1. BILLING & INVOICE ANALYSIS:
   - Analyze uploaded invoices and bills
   - Extract key information (amounts, due dates, account numbers, etc.)
   - Explain billing details and charges
   - Provide payment guidance and options
   - Handle billing disputes and complaints

2. GENERAL KNOWLEDGE & MARKET ANALYSIS:
   - Answer questions about financial markets, stocks, mutual funds
   - Explain economic trends and market movements
   - Provide insights on investment performance
   - Discuss market volatility, inflation impacts, etc.
   - Answer general knowledge questions on any topic

3. CUSTOMER SERVICE ACTIONS:
   - Process payment requests
   - Handle address changes
   - File complaints and claims
   - Connect users with appropriate service providers

Always provide helpful, accurate, and contextual responses. When discussing financial markets or investments, include relevant disclaimers about market risks and the importance of professional financial advice.

If you have access to invoice data, use it to provide specific answers. For general questions, draw from your knowledge base to provide comprehensive responses.`;

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload and process PDF
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    // Extract structured data using OpenAI
    const structuredData = await extractStructuredFields(extractedText);
    
    // Generate conversation ID
    const conversationId = uuidv4();
    
    // Store conversation context
    conversationStore.set(conversationId, {
      invoiceData: structuredData,
      extractedText: extractedText,
      filename: req.file.originalname,
      uploadTime: new Date().toISOString()
    });

    res.json({
      success: true,
      conversationId,
      data: structuredData,
      filename: req.file.originalname
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF', 
      details: error.message 
    });
  }
});

// Enhanced chat endpoint for generic AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, chatHistory = [] } = req.body;

    console.log('=== CHAT REQUEST ===');
    console.log('Message:', message);
    console.log('Conversation ID:', conversationId);
    console.log('Chat History Length:', chatHistory.length);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get conversation context if available
    const context = conversationId ? conversationStore.get(conversationId) : null;
    console.log('Context found:', !!context);
    console.log('Invoice data available:', !!(context && context.invoiceData));
    
    // Build context for the AI
    let contextInfo = '';
    if (context && context.invoiceData) {
      const invoiceDetails = JSON.stringify(context.invoiceData, null, 2);
      contextInfo = `\n\nCURRENT INVOICE CONTEXT:\n${invoiceDetails}`;
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + contextInfo }
    ];

    // Add chat history (last 10 messages to maintain context)
    const recentHistory = chatHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current message
    messages.push({ role: 'user', content: message });

    // Get AI response
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = response.choices[0].message.content;

    // Check if this is an action request
    const actionResult = await handleActionRequest(message, context);

    res.json({
      success: true,
      response: aiResponse,
      action: actionResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message', 
      details: error.message 
    });
  }
});

// Get conversation context
app.get('/api/conversation/:id', (req, res) => {
  const { id } = req.params;
  const context = conversationStore.get(id);

  if (!context) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({
    success: true,
    data: context.invoiceData,
    filename: context.filename,
    uploadTime: context.uploadTime
  });
});

// Debug endpoint to check all conversations
app.get('/api/debug/conversations', (req, res) => {
  const conversations = Array.from(conversationStore.entries()).map(([id, data]) => ({
    id,
    hasInvoiceData: !!data.invoiceData,
    filename: data.filename,
    uploadTime: data.uploadTime,
    billerName: data.invoiceData?.biller_name,
    amount: data.invoiceData?.amount_due
  }));

  res.json({
    success: true,
    totalConversations: conversations.length,
    conversations
  });
});

// Helper function to extract structured fields from invoice text
async function extractStructuredFields(text) {
  try {
    const prompt = `Extract the following fields from the invoice/bill text as JSON:
    - biller_name (company/organization name)
    - account_number
    - due_date
    - amount_due (numeric value only)
    - billing_period
    - service_description
    - status (paid/unpaid/overdue)
    - invoice_number
    - billing_address
    - service_address

    Only use values present in the text. If a value is not found, return null.
    Return only valid JSON without any additional text.

    Invoice text:
    ${text}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 800
    });

    let jsonText = response.choices[0].message.content.trim();
    
    // Clean up the response
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3, -3);
    }

    const parsedData = JSON.parse(jsonText);
    
    // Add metadata
    parsedData.raw_text = text;
    parsedData.processed_at = new Date().toISOString();
    
    return parsedData;

  } catch (error) {
    console.error('Structured extraction error:', error);
    // Return basic fallback structure
    return {
      biller_name: null,
      account_number: null,
      due_date: null,
      amount_due: null,
      billing_period: null,
      service_description: null,
      status: 'unknown',
      invoice_number: null,
      billing_address: null,
      service_address: null,
      raw_text: text,
      processed_at: new Date().toISOString(),
      extraction_error: error.message
    };
  }
}

// Helper function to handle action requests
async function handleActionRequest(message, context) {
  const messageLower = message.toLowerCase();
  
  // Payment action
  if (messageLower.includes('pay') && messageLower.includes('bill')) {
    if (context && context.invoiceData) {
      const amount = context.invoiceData.amount_due;
      const biller = context.invoiceData.biller_name;
      return {
        type: 'payment',
        message: `Payment of $${amount} to ${biller} has been initiated. You will receive a confirmation shortly.`,
        success: true
      };
    }
    return {
      type: 'payment',
      message: 'Please upload an invoice first to process payment.',
      success: false
    };
  }
  
  // Address change
  if (messageLower.includes('change') && messageLower.includes('address')) {
    return {
      type: 'address_change',
      message: 'Address change request has been submitted. You will receive confirmation via email within 24 hours.',
      success: true
    };
  }
  
  // Complaint filing
  if (messageLower.includes('file') && messageLower.includes('complaint')) {
    const referenceId = Math.random().toString(36).substr(2, 8).toUpperCase();
    return {
      type: 'complaint',
      message: `Complaint filed successfully. Reference ID: #${referenceId}. You will be contacted within 2 business days.`,
      success: true,
      referenceId
    };
  }
  
  return null;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
});

module.exports = app;
