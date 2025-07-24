import React from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaDollarSign, FaCalendarAlt, FaChartLine, FaNewspaper, FaGlobe } from 'react-icons/fa';

const SuggestedQuestions = ({ onQuestionClick, hasInvoice }) => {
  const billingQuestions = [
    {
      icon: FaDollarSign,
      text: "What is my amount due?",
      color: "text-green-400"
    },
    {
      icon: FaCalendarAlt,
      text: "When is this bill due?",
      color: "text-orange-400"
    },
    {
      icon: FaQuestionCircle,
      text: "What services am I being charged for?",
      color: "text-blue-400"
    },
    {
      icon: FaDollarSign,
      text: "Pay this bill",
      color: "text-purple-400"
    }
  ];

  const generalQuestions = [
    {
      icon: FaChartLine,
      text: "Why are mutual fund returns low this month?",
      color: "text-red-400"
    },
    {
      icon: FaChartLine,
      text: "What's causing the stock market decline?",
      color: "text-yellow-400"
    },
    {
      icon: FaNewspaper,
      text: "Explain the current inflation trends",
      color: "text-cyan-400"
    },
    {
      icon: FaGlobe,
      text: "How does the economy affect my investments?",
      color: "text-pink-400"
    }
  ];

  const questions = hasInvoice ? billingQuestions : generalQuestions;

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      className="p-3 sm:p-4 border-t border-dark-700"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.h4
        className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3 flex items-center"
        variants={itemVariants}
      >
        <FaQuestionCircle className="mr-1 sm:mr-2 text-xs sm:text-sm" />
        {hasInvoice ? 'Try asking about your bill:' : 'Try these questions:'}
      </motion.h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700 hover:border-dark-600 text-left transition-all duration-200 group"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onQuestionClick(question.text)}
          >
            <div className={`p-1.5 sm:p-2 rounded-lg bg-dark-700 ${question.color} group-hover:scale-110 transition-transform`}>
              <question.icon className="text-xs sm:text-sm" />
            </div>
            <span className="text-gray-300 text-xs sm:text-sm font-medium group-hover:text-white transition-colors">
              {question.text}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Additional context */}
      <motion.div
        className="mt-4 text-center"
        variants={itemVariants}
      >
        <p className="text-xs text-gray-500">
          {hasInvoice 
            ? "I can help you understand your bill and take actions like payments or address changes."
            : "I can answer questions about finance, markets, or any general topic you're curious about."
          }
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SuggestedQuestions;
