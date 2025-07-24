import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUpload } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import SuggestedQuestions from './SuggestedQuestions';
import VoiceInterface from './VoiceInterface';
import { Button } from './ui/button';
import { Input } from './ui/input';

const ChatInterface = ({ conversationId, invoiceData, onFileUpload, isLoading: isFileUploading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    messages,
    isLoading,
    sendMessage,
    setConversationId,
    setInvoiceData
  } = useChat();

  // Update context when props change
  useEffect(() => {
    if (conversationId) {
      setConversationId(conversationId);
    }
  }, [conversationId, setConversationId]);

  useEffect(() => {
    if (invoiceData) {
      setInvoiceData(invoiceData);
    }
  }, [invoiceData, setInvoiceData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleSuggestedQuestion = async (question) => {
    await sendMessage(question);
  };

  const handleVoiceTranscript = (transcript, confidence) => {
    // Voice interface now handles its own conversation flow
    // This is mainly for fallback or integration purposes
    if (transcript && transcript.trim()) {
      setInputMessage(transcript);
    }
  };

  const handleVoiceError = (error) => {
    console.error('Voice input error:', error);
    // Show user-friendly error message
    if (error === 'not-allowed') {
      // Could show a toast: "Please allow microphone access to use voice features"
    } else if (error === 'network') {
      // Could show a toast: "Network error - please check your connection"
    }
  };

  // Voice input is now handled by VoiceInterface component

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        await onFileUpload(file);
      } catch (error) {
        console.error('File upload error:', error);
      }
    }
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] sm:min-h-[600px] max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <motion.div
        className="glass-dark rounded-t-xl p-3 sm:p-4 border-b border-dark-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(14, 165, 233, 0.3)",
                "0 0 40px rgba(14, 165, 233, 0.6)",
                "0 0 20px rgba(14, 165, 233, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaRobot className="text-white text-sm sm:text-base" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">AI Assistant</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {isLoading ? 'Thinking...' : 'Ready to help'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-dark-900/50">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              className="text-center py-4 sm:py-8 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <FaRobot className="text-lg sm:text-2xl text-white" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Welcome! How can I help you today?
              </h3>
              <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto px-4">
                I can help you with your bills, answer questions about market trends,
                or assist with any general inquiries you might have.
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="flex items-center space-x-3 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <FaRobot className="text-white text-sm" />
            </div>
            <div className="glass rounded-lg p-3">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <SuggestedQuestions 
          onQuestionClick={handleSuggestedQuestion}
          hasInvoice={!!invoiceData}
        />
      )}

      {/* Input Area */}
      <motion.div
        className="glass-dark rounded-b-xl p-3 sm:p-4 border-t border-dark-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFileUpload}
            className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 text-gray-400 hover:text-white hover:bg-primary-500/10"
            disabled={isLoading || isFileUploading}
            title="Upload PDF Invoice"
          >
            <FaUpload className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your bills or general questions..."
              className="pr-12 sm:pr-16 text-sm sm:text-base"
              disabled={isLoading || isFileUploading}
            />

            {/* Voice input button */}
            <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2">
              <VoiceInterface
                onTranscript={handleVoiceTranscript}
                onError={handleVoiceError}
                className="scale-75 sm:scale-100"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
            size="icon"
          >
            <FaPaperPlane className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </form>

        {/* Voice status - now handled by VoiceInterface component */}
      </motion.div>
    </div>
  );
};

export default ChatInterface;
