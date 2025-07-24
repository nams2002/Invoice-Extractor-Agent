import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaFilePdf, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import VoiceInterface from './VoiceInterface';

const FileUpload = ({ onFileUpload, isLoading }) => {
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showVoiceHelper, setShowVoiceHelper] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus(null);
      
      try {
        await onFileUpload(file);
        setUploadStatus('success');
      } catch (error) {
        setUploadStatus('error');
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleVoiceTranscript = (transcript) => {
    // Voice can be used to provide instructions or ask questions
    // For now, we'll just show a helpful message
    setShowVoiceHelper(true);
    setTimeout(() => setShowVoiceHelper(false), 3000);
  };

  const handleVoiceError = (error) => {
    console.error('Voice error in FileUpload:', error);
  };

  return (
    <motion.div
      className="card-glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <FaFilePdf className="mr-2 text-red-400" />
          Upload Invoice/Bill
        </h2>

        {/* Small voice helper icon */}
        <div className="relative">
          <VoiceInterface
            onTranscript={handleVoiceTranscript}
            onError={handleVoiceError}
            className="scale-75"
          />

          {/* Voice helper tooltip */}
          <AnimatePresence>
            {showVoiceHelper && (
              <motion.div
                className="absolute right-0 top-12 bg-primary-500 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Voice input available in chat!
                <div className="absolute -top-1 right-4 w-2 h-2 bg-primary-500 transform rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-primary-400 bg-primary-500/10' 
            : 'border-dark-600 hover:border-primary-500 hover:bg-primary-500/5'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <FaSpinner className="text-4xl text-primary-500 mb-4 animate-spin" />
              <p className="text-gray-300">Processing your file...</p>
            </motion.div>
          ) : uploadStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <FaCheck className="text-2xl text-white" />
              </motion.div>
              <p className="text-green-400 font-medium">File uploaded successfully!</p>
              <p className="text-gray-400 text-sm mt-1">{uploadedFile?.name}</p>
            </motion.div>
          ) : uploadStatus === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <FaTimes className="text-2xl text-white" />
              </motion.div>
              <p className="text-red-400 font-medium">Upload failed</p>
              <p className="text-gray-400 text-sm mt-1">Please try again</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FaUpload className="text-4xl text-gray-400 mb-4" />
              </motion.div>
              
              {isDragActive ? (
                <p className="text-primary-400 font-medium">Drop your PDF here...</p>
              ) : (
                <>
                  <p className="text-gray-300 font-medium mb-2">
                    Drag & drop your PDF here
                  </p>
                  <p className="text-gray-500 text-sm">
                    or click to browse files
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File format info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Supported format: PDF (max 10MB)
        </p>
      </div>
    </motion.div>
  );
};

export default FileUpload;
