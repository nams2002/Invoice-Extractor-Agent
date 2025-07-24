import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaStop, FaTimes, FaFileInvoice } from 'react-icons/fa';
import VoiceAnimation from './VoiceAnimation';
import { useChat } from '../context/ChatContext';

const VoiceInterface = ({ onTranscript, onError, className = '' }) => {
  // Get chat context for invoice data and conversation management
  const {
    conversationId,
    invoiceData,
    messages
  } = useChat();

  const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [voiceConversationHistory, setVoiceConversationHistory] = useState([]);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const autoRestartTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setConfidence(0);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            maxConfidence = Math.max(maxConfidence, result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        setConfidence(maxConfidence);

        if (finalTranscript && finalTranscript.trim()) {
          setTimeout(() => {
            handleVoiceQuery(finalTranscript.trim());
          }, 500);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        // Only show error for significant issues, not network hiccups
        if (event.error !== 'network' && event.error !== 'no-speech' && event.error !== 'aborted') {
          if (onError) {
            onError(event.error);
          }
        }

        // Auto-restart listening if session is active and error is recoverable
        if (isVoiceSessionActive && (event.error === 'no-speech' || event.error === 'network')) {
          autoRestartTimeoutRef.current = setTimeout(() => {
            if (isVoiceSessionActive && !isListening && !isSpeaking && !isProcessing) {
              startListening();
            }
          }, 2000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);

        // Auto-restart listening if session is active and not manually stopped
        if (isVoiceSessionActive && !isSpeaking && !isProcessing) {
          autoRestartTimeoutRef.current = setTimeout(() => {
            if (isVoiceSessionActive && !isListening) {
              startListening();
            }
          }, 1000);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (autoRestartTimeoutRef.current) {
        clearTimeout(autoRestartTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceSessionActive, isSpeaking, isProcessing]);

  // Handle voice query and AI response using the chat context
  const handleVoiceQuery = async (query) => {
    if (!query || query.trim().length === 0) return;

    try {
      setIsProcessing(true);
      setTranscript(query);

      // Add user message to voice conversation history for display
      const userMessage = {
        role: 'user',
        content: query,
        timestamp: Date.now(),
        id: 'voice-' + Date.now()
      };
      setVoiceConversationHistory(prev => [...prev, userMessage]);

      // Prepare chat history from the main chat context for better context
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Add voice conversation history to maintain context within voice session
      const voiceHistory = voiceConversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Combine both histories for comprehensive context
      const combinedHistory = [...chatHistory, ...voiceHistory];

      // Debug logging
      console.log('Voice Query:', query);
      console.log('Conversation ID:', conversationId);
      console.log('Invoice Data Available:', !!invoiceData);
      console.log('Invoice Data:', invoiceData);
      console.log('Combined History Length:', combinedHistory.length);

      // If no conversation ID but we have invoice data, there might be a context issue
      if (!conversationId && invoiceData) {
        console.warn('Invoice data exists but no conversation ID - this might cause issues');
      }

      // Send query to AI using the same endpoint as chat with full context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          conversationId: conversationId, // Use the main conversation ID to access invoice data
          chatHistory: combinedHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AI Response Data:', data);

      let aiText = data.response || "I understand your request, but I need more information to help you properly.";

      // If no invoice data and asking about invoice, provide helpful guidance
      if (!conversationId && (query.toLowerCase().includes('bill') || query.toLowerCase().includes('invoice') || query.toLowerCase().includes('amount'))) {
        aiText = "I don't see any invoice data loaded yet. Please upload an invoice first using the upload button in the chat interface, then I can help you with specific billing questions.";
      }

      // Add AI response to voice conversation history
      const aiMessage = {
        role: 'assistant',
        content: aiText,
        timestamp: Date.now(),
        id: 'voice-ai-' + Date.now(),
        action: data.action // Include any actions like payment confirmations
      };
      setVoiceConversationHistory(prev => [...prev, aiMessage]);

      setAiResponse(aiText);
      setIsProcessing(false);

      // Speak the AI response
      speakResponse(aiText);

      // If there's an action result, speak that too
      if (data.action && data.action.message) {
        setTimeout(() => {
          speakResponse(data.action.message);
        }, 1000);
      }

    } catch (error) {
      console.error('Voice query error:', error);
      setIsProcessing(false);

      // More specific error handling
      let errorMessage;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = "I'm having trouble connecting to the server. Please check your internet connection.";
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = "The server is experiencing issues. Please try again in a moment.";
      } else {
        errorMessage = "I encountered a technical issue. Let me try to help you in a different way.";
      }

      setAiResponse(errorMessage);
      speakResponse(errorMessage);
    }
  };

  // Text-to-speech function
  const speakResponse = (text) => {
    if ('speechSynthesis' in window && text && text.trim()) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Try to use a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Google') ||
        voice.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Clear the AI response after speaking
        setTimeout(() => {
          setAiResponse('');
          setTranscript('');
          // Auto-restart listening if session is still active
          if (isVoiceSessionActive && !isListening) {
            autoRestartTimeoutRef.current = setTimeout(() => {
              if (isVoiceSessionActive && !isListening && !isProcessing) {
                startListening();
              }
            }, 1500);
          }
        }, 500);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        // Still try to restart listening on speech error
        if (isVoiceSessionActive) {
          setTimeout(() => {
            if (isVoiceSessionActive && !isListening && !isProcessing) {
              startListening();
            }
          }, 1000);
        }
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const startListening = () => {
    if (!isSupported) {
      if (onError) {
        onError('Speech recognition is not supported in your browser');
      }
      return;
    }

    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        // Clear any pending auto-restart
        if (autoRestartTimeoutRef.current) {
          clearTimeout(autoRestartTimeoutRef.current);
        }
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // Don't show error for already started recognition
        if (!error.message.includes('already started')) {
          if (onError) {
            onError('Failed to start speech recognition');
          }
        }
      }
    }
  };

  const stopVoiceSession = () => {
    // Clear any pending timeouts
    if (autoRestartTimeoutRef.current) {
      clearTimeout(autoRestartTimeoutRef.current);
    }

    // Stop speech recognition
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    // Stop speech synthesis
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Reset all states
    setIsVoiceSessionActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
    setConfidence(0);
    setAiResponse('');
    setVoiceConversationHistory([]);
  };

  const startVoiceSession = () => {
    if (!isSupported) {
      if (onError) {
        onError('Speech recognition is not supported in your browser');
      }
      return;
    }

    setIsVoiceSessionActive(true);
    setVoiceConversationHistory([]);

    // Start listening after a brief delay to ensure UI is ready
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const toggleVoiceSession = () => {
    if (isVoiceSessionActive) {
      stopVoiceSession();
    } else {
      startVoiceSession();
    }
  };

  // Text-to-speech functionality (available for future use)
  // const speak = (text) => {
  //   if ('speechSynthesis' in window) {
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     utterance.rate = 0.9;
  //     utterance.pitch = 1;
  //     utterance.volume = 0.8;
  //     speechSynthesis.speak(utterance);
  //   }
  // };

  // Full-Screen Voice Interface Portal
  const voiceInterfacePortal = isVoiceSessionActive && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden"
        data-voice-interface-active="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: 9999 }}
      >
            {/* Enhanced Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black" />

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent" />

            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 4 + 1}px`,
                    height: `${Math.random() * 4 + 1}px`,
                    background: `rgba(${Math.random() > 0.5 ? '59, 130, 246' : '147, 197, 253'}, ${Math.random() * 0.3 + 0.1})`,
                  }}
                  animate={{
                    y: [0, -100 - Math.random() * 100],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 backdrop-blur-sm"
                  style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`,
                    width: `${Math.random() * 100 + 50}px`,
                    height: `${Math.random() * 100 + 50}px`,
                  }}
                  animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50],
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              className="relative z-10 flex flex-col items-center justify-center h-full px-8"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Main content container with better spacing */}
              <div className="flex flex-col items-center space-y-16 w-full max-w-lg">
              {/* Central Siri Circle */}
              <div className="relative">
                {/* Outer Glow Rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`ring-${i}`}
                    className={`absolute rounded-full border ${
                      isSpeaking
                        ? 'border-green-400/20'
                        : isProcessing
                        ? 'border-yellow-400/20'
                        : 'border-blue-400/20'
                    }`}
                    style={{
                      width: `${200 + i * 40}px`,
                      height: `${200 + i * 40}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Main Circle */}
                <motion.div
                  className={`relative w-48 h-48 sm:w-52 sm:h-52 lg:w-56 lg:h-56 rounded-full backdrop-blur-xl border-2 flex items-center justify-center shadow-2xl ${
                    isSpeaking
                      ? 'bg-gradient-to-br from-green-400/20 to-green-600/30 border-green-400/40'
                      : isProcessing
                      ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/30 border-yellow-400/40'
                      : 'bg-gradient-to-br from-blue-400/20 to-blue-600/30 border-blue-400/40'
                  }`}
                  animate={{
                    scale: isSpeaking ? [1, 1.08, 1] : isProcessing ? [1, 1.05, 1] : [1, 1.03, 1],
                    boxShadow: isSpeaking
                      ? [
                          "0 0 40px rgba(34, 197, 94, 0.3), 0 0 80px rgba(34, 197, 94, 0.1)",
                          "0 0 80px rgba(34, 197, 94, 0.5), 0 0 120px rgba(34, 197, 94, 0.2)",
                          "0 0 40px rgba(34, 197, 94, 0.3), 0 0 80px rgba(34, 197, 94, 0.1)"
                        ]
                      : isProcessing
                      ? [
                          "0 0 40px rgba(234, 179, 8, 0.3), 0 0 80px rgba(234, 179, 8, 0.1)",
                          "0 0 80px rgba(234, 179, 8, 0.5), 0 0 120px rgba(234, 179, 8, 0.2)",
                          "0 0 40px rgba(234, 179, 8, 0.3), 0 0 80px rgba(234, 179, 8, 0.1)"
                        ]
                      : [
                          "0 0 40px rgba(59, 130, 246, 0.2), 0 0 80px rgba(59, 130, 246, 0.1)",
                          "0 0 80px rgba(59, 130, 246, 0.4), 0 0 120px rgba(59, 130, 246, 0.15)",
                          "0 0 40px rgba(59, 130, 246, 0.2), 0 0 80px rgba(59, 130, 246, 0.1)"
                        ]
                  }}
                  transition={{
                    duration: isSpeaking ? 1.2 : isProcessing ? 1.8 : 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Enhanced Inner Siri Animation */}
                  <div className="relative w-32 h-16 sm:w-36 sm:h-18 lg:w-40 lg:h-20 flex items-center justify-center">
                    {/* Main Waveform */}
                    <div className="flex items-center justify-center space-x-1.5">
                      {[...Array(15)].map((_, i) => {
                        const isCenter = Math.abs(i - 7) < 2;
                        const distance = Math.abs(i - 7);
                        return (
                          <motion.div
                            key={i}
                            className={`rounded-full ${
                              isSpeaking
                                ? 'bg-gradient-to-t from-green-300 to-green-500'
                                : isProcessing
                                ? 'bg-gradient-to-t from-yellow-300 to-yellow-500'
                                : 'bg-gradient-to-t from-blue-300 to-blue-500'
                            }`}
                            style={{
                              width: isCenter ? '3px' : '2px',
                            }}
                            animate={{
                              height: isSpeaking
                                ? [8, 40 - distance * 3, 8]
                                : isProcessing
                                ? [8, 30 - distance * 2, 8]
                                : [8, 20 - distance * 1, 8],
                              opacity: [0.3, 1, 0.3],
                              scaleY: isSpeaking ? [1, 1.2, 1] : [1, 1.1, 1],
                            }}
                            transition={{
                              duration: isSpeaking ? 0.6 : isProcessing ? 0.8 : 1.2,
                              repeat: Infinity,
                              delay: i * 0.08,
                              ease: "easeInOut"
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Central Pulse Dot */}
                    <motion.div
                      className={`absolute w-2 h-2 rounded-full ${
                        isSpeaking
                          ? 'bg-green-400'
                          : isProcessing
                          ? 'bg-yellow-400'
                          : 'bg-blue-400'
                      }`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Outer Pulse Rings - Contained within screen */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className={`absolute inset-0 rounded-full border ${
                      isSpeaking
                        ? 'border-green-400/20'
                        : isProcessing
                        ? 'border-yellow-400/20'
                        : 'border-primary-400/20'
                    }`}
                    animate={{
                      scale: [1, 1.3 + (i * 0.2)],
                      opacity: [0.6, 0]
                    }}
                    transition={{
                      duration: isSpeaking ? 2 : isProcessing ? 3 : 4,
                      repeat: Infinity,
                      delay: i * (isSpeaking ? 0.4 : isProcessing ? 0.6 : 0.8),
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>







              {/* Enhanced Controls */}
              <motion.div
                className="flex items-center space-x-8 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {/* Enhanced Manual Listen Button */}
                {!isListening && !isSpeaking && !isProcessing && (
                  <motion.button
                    type="button"
                    onClick={startListening}
                    className="relative w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/30 hover:from-blue-400/30 hover:to-blue-500/40 backdrop-blur-xl text-blue-400 rounded-full border border-blue-400/40 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-500/25"
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.9 }}
                    title="Start Listening"
                  >
                    <FaMicrophone className="w-6 h-6" />

                    {/* Button glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-400/20"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  </motion.button>
                )}

                {/* Enhanced Stop Session Button */}
                <motion.button
                  type="button"
                  onClick={stopVoiceSession}
                  className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-500/20 to-red-600/30 hover:from-red-400/30 hover:to-red-500/40 backdrop-blur-xl text-red-400 rounded-full border border-red-400/40 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-red-500/25"
                  whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(239, 68, 68, 0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  title="End Voice Session"
                >
                  <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />

                  {/* Button glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400/20"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0, 0.2, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                </motion.button>
              </motion.div>





              {/* Enhanced Status Display */}
              <motion.div
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center space-y-4 w-full max-w-md px-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <motion.p
                  className="text-white text-xl font-light tracking-wide leading-relaxed"
                  animate={{
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {isSpeaking
                    ? "Speaking..."
                    : isProcessing
                    ? "Processing your request..."
                    : isListening
                    ? "Listening..."
                    : "Voice session active"}
                </motion.p>

                <motion.div
                  className="flex items-center justify-center space-x-3 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                >
                  <motion.div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSpeaking
                        ? 'bg-green-400'
                        : isProcessing
                        ? 'bg-yellow-400'
                        : isListening
                        ? 'bg-blue-400'
                        : 'bg-gray-400'
                    }`}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <p className="text-white/80 text-base font-light tracking-wide">
                    Speak naturally • Tap X to end
                  </p>
                </motion.div>
              </motion.div>
              </div>
            </motion.div>
          </motion.div>
    </AnimatePresence>,
    document.body
  );

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Render the portal */}
      {voiceInterfacePortal}

      {/* Enhanced Microphone Button */}
      <motion.button
        type="button"
        onClick={toggleVoiceSession}
        disabled={!isSupported}
        className={`
          relative p-4 rounded-full transition-all duration-300 backdrop-blur-sm
          ${isVoiceSessionActive
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-xl shadow-red-500/40'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-xl shadow-blue-500/40'
          }
          ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        whileHover={isSupported ? {
          scale: 1.1,
          boxShadow: isVoiceSessionActive
            ? "0 0 40px rgba(239, 68, 68, 0.5)"
            : "0 0 40px rgba(59, 130, 246, 0.5)"
        } : {}}
        whileTap={isSupported ? { scale: 0.9 } : {}}
        animate={isVoiceSessionActive ? {
          boxShadow: [
            "0 0 30px rgba(239, 68, 68, 0.4)",
            "0 0 50px rgba(239, 68, 68, 0.7)",
            "0 0 30px rgba(239, 68, 68, 0.4)"
          ]
        } : {
          boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.3)",
            "0 0 30px rgba(59, 130, 246, 0.5)",
            "0 0 20px rgba(59, 130, 246, 0.3)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        title={isVoiceSessionActive ? "End Voice Session" : "Start Voice Session"}
      >
        <motion.div
          animate={{
            rotate: isVoiceSessionActive ? [0, 180, 360] : 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          {isVoiceSessionActive ? (
            <FaStop className="w-5 h-5" />
          ) : (
            <FaMicrophone className="w-5 h-5" />
          )}
        </motion.div>

        {/* Enhanced Pulse animation when active */}
        {isVoiceSessionActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400/60"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.8, 0, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-red-300/40"
              animate={{
                scale: [1, 2.2, 1],
                opacity: [0.6, 0, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
                ease: "easeOut"
              }}
            />
          </>
        )}

        {/* Idle glow effect */}
        {!isVoiceSessionActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>


    </div>
  );
};

export default VoiceInterface;
