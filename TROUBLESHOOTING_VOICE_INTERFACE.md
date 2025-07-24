# Troubleshooting Voice Interface Issues

## Current Issues Identified

1. **Voice interface not responding to invoice questions**
2. **Text formatting issues in the interface**
3. **Possible conversation ID/context issues**

## Step-by-Step Troubleshooting

### Step 1: Verify Backend is Running
Check that both servers are running:
- Frontend: http://localhost:3001
- Backend: http://localhost:5000

### Step 2: Test Invoice Upload
1. Go to http://localhost:3001
2. Click the upload button (📄) in the chat interface
3. Upload a PDF invoice
4. You should see a green notification that the invoice was processed

### Step 3: Test Chat Interface First
1. Type in the chat: "tell me about my invoice"
2. The AI should respond with invoice details
3. If this doesn't work, the issue is with the backend/conversation storage

### Step 4: Test Voice Interface
1. Click the microphone button
2. Say "tell me about my invoice"
3. The AI should respond with the same information as the chat

### Step 5: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check the debug logs when using voice interface

## Common Issues and Solutions

### Issue 1: "No invoice data loaded"
**Cause**: Invoice wasn't uploaded properly or conversation ID is missing
**Solution**: 
1. Refresh the page
2. Upload invoice again
3. Test in chat first before using voice

### Issue 2: Voice interface not responding
**Cause**: Microphone permissions or speech recognition issues
**Solution**:
1. Check browser microphone permissions
2. Try in Chrome (best speech recognition support)
3. Speak clearly and wait for the "Listening..." indicator

### Issue 3: Text formatting looks messy
**Cause**: Long company names or invoice data
**Solution**: This has been fixed in the latest update

### Issue 4: Backend errors
**Cause**: Server issues or API problems
**Solution**:
1. Check backend terminal for error messages
2. Restart backend server if needed
3. Verify OpenAI API key is configured

## Debug Commands

### Check Conversation Storage
Visit: http://localhost:5000/api/debug/conversations
This shows all stored conversations and invoice data.

### Check Specific Conversation
Visit: http://localhost:5000/api/conversation/[CONVERSATION_ID]
Replace [CONVERSATION_ID] with the actual ID from the debug endpoint.

## Expected Behavior

### With Invoice Uploaded:
- Voice interface should show "Invoice Available" indicator
- Should respond to questions like:
  - "What's my bill amount?"
  - "When is this due?"
  - "Tell me about my invoice"
  - "Who is the biller?"

### Without Invoice:
- Should respond to general questions like:
  - "How's the stock market?"
  - "Tell me about Tesla"
  - "What's happening with inflation?"

## Current Status

The voice interface has been updated with:
1. ✅ Better error handling
2. ✅ Improved text formatting
3. ✅ Debug logging
4. ✅ Conversation context integration
5. ✅ Fallback mechanisms

## Next Steps

1. **Test the upload process** - Make sure invoices are being stored properly
2. **Verify conversation flow** - Check that chat and voice share the same context
3. **Check API responses** - Ensure the backend is returning proper invoice data
4. **Monitor logs** - Watch both frontend console and backend terminal for errors

## Quick Test Sequence

1. Refresh browser
2. Upload invoice
3. Chat: "what's my bill amount?"
4. Voice: "what's my bill amount?"
5. Both should give the same answer

If step 3 fails, the issue is with invoice processing.
If step 4 fails but step 3 works, the issue is with voice-to-chat integration.

## Contact Information

If issues persist, check:
1. Browser console for JavaScript errors
2. Backend terminal for server errors
3. Network tab in developer tools for failed API calls
4. Microphone permissions in browser settings
