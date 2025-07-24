import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaRobot, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isError = message.isError;

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  return (
    <motion.div
      className={`flex items-start space-x-2 sm:space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <motion.div
        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600'
            : isError
            ? 'bg-gradient-to-br from-red-500 to-red-600'
            : 'bg-gradient-to-br from-purple-500 to-purple-600'
        }`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {isUser ? (
          <FaUser className="text-white text-xs sm:text-sm" />
        ) : isError ? (
          <FaExclamationTriangle className="text-white text-xs sm:text-sm" />
        ) : (
          <FaRobot className="text-white text-xs sm:text-sm" />
        )}
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <motion.div
          className={`inline-block p-2 sm:p-4 rounded-xl sm:rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              : isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-300'
              : 'glass text-gray-100'
          } ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-sm sm:text-base">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </motion.div>

        {/* Action Result */}
        {message.action && (
          <motion.div
            className={`mt-2 p-3 rounded-lg border ${
              message.action.success
                ? 'bg-green-500/10 border-green-500/20 text-green-300'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              {message.action.success ? (
                <FaCheck className="text-green-400" />
              ) : (
                <FaExclamationTriangle className="text-red-400" />
              )}
              <span className="font-medium">
                {message.action.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm">{message.action.message}</p>
            {message.action.referenceId && (
              <p className="mt-1 text-xs opacity-75">
                Reference: {message.action.referenceId}
              </p>
            )}
          </motion.div>
        )}

        {/* Timestamp */}
        <motion.p
          className={`text-xs text-gray-500 mt-1 sm:mt-2 ${isUser ? 'text-right' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
