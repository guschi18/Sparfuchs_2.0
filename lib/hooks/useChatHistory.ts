'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  warning?: string;
  sessionId: string;
}

export interface ChatHistory {
  messages: ChatMessage[];
  totalMessages: number;
  currentSessionMessages: number;
}

const STORAGE_KEY = 'sparfuchs-chat-history';
const MAX_STORED_MESSAGES = 100; // Limit stored messages for performance

export function useChatHistory(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load chat history from localStorage
  useEffect(() => {
    if (!sessionId) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        const sessionMessages = parsedHistory.filter(
          (msg: ChatMessage) => msg.sessionId === sessionId
        );
        
        // Convert timestamp strings back to Date objects
        const messagesWithDates = sessionMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    } finally {
      setIsLoaded(true);
    }
  }, [sessionId]);

  // Save messages to localStorage
  const saveToStorage = useCallback((updatedMessages: ChatMessage[]) => {
    try {
      // Get all stored messages
      const stored = localStorage.getItem(STORAGE_KEY);
      let allMessages: ChatMessage[] = stored ? JSON.parse(stored) : [];
      
      // Remove old messages from current session
      allMessages = allMessages.filter(msg => msg.sessionId !== sessionId);
      
      // Add updated messages from current session
      allMessages = [...allMessages, ...updatedMessages];
      
      // Limit total stored messages
      if (allMessages.length > MAX_STORED_MESSAGES) {
        allMessages = allMessages
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, MAX_STORED_MESSAGES);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [sessionId]);

  // Add a new message
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp' | 'sessionId'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sessionId,
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      saveToStorage(updated);
      return updated;
    });

    return newMessage;
  }, [sessionId, saveToStorage]);

  // Update an existing message
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Remove a message
  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const updated = prev.filter(msg => msg.id !== messageId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear current session messages
  const clearCurrentSession = useCallback(() => {
    setMessages([]);
    saveToStorage([]);
  }, [saveToStorage]);

  // Clear all chat history
  const clearAllHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }, []);

  // Get messages from previous sessions
  const getPreviousSessionMessages = useCallback(async (limit: number = 20): Promise<ChatMessage[]> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const allMessages: ChatMessage[] = JSON.parse(stored);
      const previousMessages = allMessages
        .filter(msg => msg.sessionId !== sessionId)
        .map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
      
      return previousMessages;
    } catch (error) {
      console.error('Error getting previous session messages:', error);
      return [];
    }
  }, [sessionId]);

  // Export chat history
  const exportHistory = useCallback(() => {
    const exportData = {
      sessionId,
      exportDate: new Date().toISOString(),
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sparfuchs-chat-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [sessionId, messages]);

  const chatHistory: ChatHistory = {
    messages,
    totalMessages: messages.length,
    currentSessionMessages: messages.length,
  };

  return {
    chatHistory,
    isLoaded,
    addMessage,
    updateMessage,
    removeMessage,
    clearCurrentSession,
    clearAllHistory,
    getPreviousSessionMessages,
    exportHistory,
  };
}