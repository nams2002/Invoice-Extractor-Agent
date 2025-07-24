import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaCog, FaQuestionCircle, FaMicrophone } from 'react-icons/fa';

const Header = () => {
  const handleSettings = () => {
    alert('Settings panel coming soon!\n\nFeatures will include:\n• Theme customization\n• Language preferences\n• Notification settings\n• API configuration\n• Data export options');
  };

  const handleHelp = () => {
    const helpText = `
🎤 Voice-Enabled AI Assistant - Help

GETTING STARTED:
1. Click the upload icon (📤) next to the microphone to upload PDFs
2. Use voice input by clicking the microphone icon 🎤
3. Ask questions about your bills or general topics
4. View uploaded invoice details in the floating panel

VOICE FEATURES:
• Click microphone for voice input
• Siri-like animation during listening
• Real-time speech transcription
• Auto-send for high-confidence speech
• Works in Chrome, Edge, and Safari

CHAT FEATURES:
• Full-screen chat interface
• AI-powered responses
• Invoice analysis and insights
• General knowledge Q&A
• Market trends and financial advice

SUPPORTED FORMATS:
• PDF documents (invoices, bills, statements)

VOICE COMMANDS:
• "What's my bill amount?"
• "When is this due?"
• "Explain the stock market trends"
• "How does inflation affect my investments?"

TIPS:
• Speak clearly for better recognition
• Use the upload icon for PDF files
• Try both specific and general questions
• Voice works best in quiet environments

Need more help? Contact support@billing-assistant.com
    `;

    alert(helpText.trim());
  };

  return (
    <motion.header 
      className="glass-dark border-b border-dark-700 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(14, 165, 233, 0.3)",
                  "0 0 40px rgba(14, 165, 233, 0.6)",
                  "0 0 20px rgba(14, 165, 233, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRobot className="text-white text-lg" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text-blue">
              Agentic AI Assistant
            </h1>
            <p className="text-sm text-gray-400 flex items-center">
              <FaMicrophone className="mr-1 text-primary-400" />
              Voice-Enabled AI Assistant
            </p>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-gray-300">AI Online</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              <FaCog className="text-lg" />
            </motion.button>

            <motion.button
              onClick={handleHelp}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Help"
            >
              <FaQuestionCircle className="text-lg" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Subtitle */}
      <motion.div 
        className="max-w-7xl mx-auto mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <p className="text-center text-gray-400 text-sm">
          Ask me about your bills, market trends, or any general questions. I'm here to help! 🚀
        </p>
      </motion.div>
    </motion.header>
  );
};

export default Header;
