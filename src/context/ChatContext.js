import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null,
  invoiceData: null,
};

// Action types
const actionTypes = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CONVERSATION_ID: 'SET_CONVERSATION_ID',
  SET_INVOICE_DATA: 'SET_INVOICE_DATA',
  CLEAR_CHAT: 'CLEAR_CHAT',
  UPDATE_LAST_MESSAGE: 'UPDATE_LAST_MESSAGE',
};

// Reducer
function chatReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case actionTypes.SET_CONVERSATION_ID:
      return {
        ...state,
        conversationId: action.payload,
      };
    
    case actionTypes.SET_INVOICE_DATA:
      return {
        ...state,
        invoiceData: action.payload,
      };
    
    case actionTypes.CLEAR_CHAT:
      return {
        ...initialState,
      };
    
    case actionTypes.UPDATE_LAST_MESSAGE:
      const updatedMessages = [...state.messages];
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          ...action.payload,
        };
      }
      return {
        ...state,
        messages: updatedMessages,
      };
    
    default:
      return state;
  }
}

// Create context
const ChatContext = createContext();

// Provider component
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Action creators
  const addMessage = useCallback((message) => {
    const messageWithId = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...message,
    };
    dispatch({ type: actionTypes.ADD_MESSAGE, payload: messageWithId });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  const setConversationId = useCallback((id) => {
    dispatch({ type: actionTypes.SET_CONVERSATION_ID, payload: id });
  }, []);

  const setInvoiceData = useCallback((data) => {
    dispatch({ type: actionTypes.SET_INVOICE_DATA, payload: data });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_CHAT });
  }, []);

  const updateLastMessage = useCallback((updates) => {
    dispatch({ type: actionTypes.UPDATE_LAST_MESSAGE, payload: updates });
  }, []);

  // Send message function
  const sendMessage = useCallback(async (content, type = 'user') => {
    try {
      // Add user message
      addMessage({
        content,
        type,
        sender: 'user',
      });

      setLoading(true);
      clearError();

      // Prepare chat history for context
      const chatHistory = state.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Add current message to history
      chatHistory.push({
        role: 'user',
        content: content,
      });

      // Create system message with invoice context
      const systemMessage = {
        role: 'system',
        content: `You are an AI assistant that helps with invoice analysis and general questions.
        ${state.invoiceData ? `Current invoice data: ${JSON.stringify(state.invoiceData)}` : 'No invoice data available.'}
        Provide helpful, accurate responses about the invoice or general topics.`
      };

      // Call OpenAI API directly
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [systemMessage, ...chatHistory],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error! status: ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Add AI response
      addMessage({
        content: aiResponse,
        type: 'assistant',
        sender: 'assistant',
      });

    } catch (error) {
      console.error('Send message error:', error);
      setError(error.message || 'Failed to send message');
      
      // Add error message
      addMessage({
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        type: 'assistant',
        sender: 'assistant',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }, [state.messages, state.conversationId, addMessage, setLoading, setError, clearError]);

  // Context value
  const value = {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    invoiceData: state.invoiceData,
    
    // Actions
    addMessage,
    sendMessage,
    setLoading,
    setError,
    clearError,
    setConversationId,
    setInvoiceData,
    clearChat,
    updateLastMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;
