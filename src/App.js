import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import BackgroundAnimation from './components/BackgroundAnimation';
import InvoiceDisplay from './components/InvoiceDisplay';
import { ChatProvider } from './context/ChatContext';
import './App.css';

function App() {
  const [conversationId, setConversationId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Invoice notification stays visible until manually dismissed
  // No auto-dismiss to ensure it remains persistent during voice interactions

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      setConversationId(result.conversationId);
      setInvoiceData(result.data);
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatProvider>
      <div className="App min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 relative">
        <BackgroundAnimation />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          <main className="flex-1 flex flex-col p-3 sm:p-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {/* Full Screen Chat Interface */}
            <motion.div
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ChatInterface
                conversationId={conversationId}
                invoiceData={invoiceData}
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Hidden Invoice Display - Shows when invoice is uploaded */}
            <AnimatePresence>
              {invoiceData && (
                <motion.div
                  className="fixed bottom-4 right-4 z-40"
                  initial={{ opacity: 0, scale: 0.8, x: 100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <InvoiceDisplay
                    data={invoiceData}
                    conversationId={conversationId}
                    compact={true}
                    onClose={() => setInvoiceData(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}

export default App;
