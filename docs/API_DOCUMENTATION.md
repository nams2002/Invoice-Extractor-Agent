# 🔌 API Documentation

## Overview
The Agentic AI Billing Assistant provides a RESTful API for invoice processing and conversational AI interactions. The API is designed for easy integration with Paymentus systems and other billing platforms.

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.billing-assistant.com/api
```

## Authentication
Currently using API key authentication. Production will support JWT tokens and OAuth integration.

```javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

## Endpoints

### 📄 Invoice Processing

#### POST /api/upload
Upload and process an invoice document.

**Request:**
```http
POST /api/upload
Content-Type: multipart/form-data

{
  "file": [binary file data],
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123456789",
    "invoiceData": {
      "biller_name": "CODEZERO2PHI SOLUTIONS (OPC) P...",
      "account_number": "110055552444",
      "amount_due": "9463.00",
      "due_date": "7/7/2025",
      "invoice_number": "NINV#001",
      "service_address": "Tower 1, Okaya Blue Silicon HR AUT...",
      "service_description": "Backend Intern",
      "status": "unpaid"
    },
    "extractedText": "Full extracted text from document...",
    "processingTime": 3.2
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF and image files are supported",
    "details": "Supported formats: PDF, JPG, PNG, JPEG"
  }
}
```

### 💬 Chat Interface

#### POST /api/chat
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "What's the total amount due on this invoice?",
  "conversationId": "conv_123456789",
  "context": {
    "hasInvoiceData": true,
    "invoiceId": "inv_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "The total amount due on this invoice is $9,463.00, and it's due on July 7, 2025.",
    "conversationId": "conv_123456789",
    "messageId": "msg_987654321",
    "timestamp": "2025-01-22T10:30:00Z",
    "processingTime": 1.8
  }
}
```

#### GET /api/conversation/:id
Retrieve conversation history.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_123456789",
    "messages": [
      {
        "id": "msg_001",
        "type": "user",
        "content": "What's the amount due?",
        "timestamp": "2025-01-22T10:25:00Z"
      },
      {
        "id": "msg_002",
        "type": "assistant",
        "content": "The amount due is $9,463.00",
        "timestamp": "2025-01-22T10:25:02Z"
      }
    ],
    "invoiceData": { /* invoice data if available */ },
    "createdAt": "2025-01-22T10:20:00Z",
    "updatedAt": "2025-01-22T10:30:00Z"
  }
}
```

### 🔍 System Information

#### GET /api/health
Check system health and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-22T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "ai": "operational",
    "storage": "operational",
    "database": "operational"
  },
  "metrics": {
    "uptime": "99.9%",
    "avgResponseTime": "2.1s",
    "requestsPerMinute": 45
  }
}
```

## Data Models

### Invoice Data Structure
```typescript
interface InvoiceData {
  biller_name: string;
  account_number: string;
  amount_due: string;
  due_date: string;
  invoice_number: string;
  service_address: string;
  service_description: string;
  status: 'paid' | 'unpaid' | 'overdue';
  currency?: string;
  tax_amount?: string;
  subtotal?: string;
  payment_methods?: string[];
}
```

### Chat Message Structure
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    sources?: string[];
  };
}
```

### Conversation Structure
```typescript
interface Conversation {
  id: string;
  messages: ChatMessage[];
  invoiceData?: InvoiceData;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}
```

## Error Handling

### Error Codes
- `INVALID_FILE_TYPE`: Unsupported file format
- `FILE_TOO_LARGE`: File exceeds size limit (10MB)
- `PROCESSING_FAILED`: AI processing error
- `CONVERSATION_NOT_FOUND`: Invalid conversation ID
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_API_KEY`: Authentication failed

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "timestamp": "2025-01-22T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## Rate Limiting
- **Upload Endpoint**: 10 requests per minute per API key
- **Chat Endpoint**: 60 requests per minute per API key
- **Health Endpoint**: 100 requests per minute per API key

## File Upload Specifications

### Supported Formats
- **PDF**: Up to 10MB
- **Images**: JPG, PNG, JPEG up to 5MB
- **Multi-page**: Supported for PDF files

### Processing Capabilities
- Text extraction from scanned documents
- Table recognition and data extraction
- Multi-language support (English primary)
- Handwritten text recognition (limited)

## Integration Examples

### JavaScript/React
```javascript
// Upload invoice
const uploadInvoice = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: formData
  });
  
  return response.json();
};

// Send chat message
const sendMessage = async (message, conversationId) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      conversationId
    })
  });
  
  return response.json();
};
```

### Python
```python
import requests

# Upload invoice
def upload_invoice(file_path, api_key):
    with open(file_path, 'rb') as file:
        files = {'file': file}
        headers = {'Authorization': f'Bearer {api_key}'}
        
        response = requests.post(
            'http://localhost:5000/api/upload',
            files=files,
            headers=headers
        )
        
        return response.json()

# Send chat message
def send_message(message, conversation_id, api_key):
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'message': message,
        'conversationId': conversation_id
    }
    
    response = requests.post(
        'http://localhost:5000/api/chat',
        json=data,
        headers=headers
    )
    
    return response.json()
```

## Webhooks (Future Feature)

### Invoice Processing Complete
```json
{
  "event": "invoice.processed",
  "data": {
    "conversationId": "conv_123456789",
    "invoiceData": { /* extracted data */ },
    "processingTime": 3.2,
    "timestamp": "2025-01-22T10:30:00Z"
  }
}
```

### Payment Status Update
```json
{
  "event": "payment.status_changed",
  "data": {
    "invoiceId": "inv_123456789",
    "oldStatus": "unpaid",
    "newStatus": "paid",
    "timestamp": "2025-01-22T10:30:00Z"
  }
}
```

---
*API designed for reliability, scalability, and ease of integration with existing billing systems.*
