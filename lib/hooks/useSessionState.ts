'use client';

import { useState, useEffect } from 'react';

export interface SessionState {
  sessionId: string;
  selectedMarkets: string[];
  chatStarted: boolean;
  preferences: {
    autoScroll: boolean;
    showTimestamps: boolean;
    compactMode: boolean;
  };
}

const DEFAULT_SESSION_STATE: SessionState = {
  sessionId: '',
  selectedMarkets: ['Aldi', 'Lidl', 'Rewe', 'Edeka', 'Penny'],
  chatStarted: false,
  preferences: {
    autoScroll: true,
    showTimestamps: true,
    compactMode: false,
  },
};

const STORAGE_KEY = 'sparfuchs-session';

export function useSessionState() {
  const [sessionState, setSessionState] = useState<SessionState>(DEFAULT_SESSION_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load session state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setSessionState({
          ...DEFAULT_SESSION_STATE,
          ...parsedState,
          sessionId: parsedState.sessionId || generateSessionId(),
        });
      } else {
        setSessionState(prev => ({
          ...prev,
          sessionId: generateSessionId(),
        }));
      }
    } catch (error) {
      console.error('Error loading session state:', error);
      setSessionState(prev => ({
        ...prev,
        sessionId: generateSessionId(),
      }));
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save session state to localStorage
  const saveSessionState = (newState: Partial<SessionState>) => {
    const updatedState = { ...sessionState, ...newState };
    setSessionState(updatedState);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  };

  // Update selected markets
  const updateSelectedMarkets = (markets: string[]) => {
    saveSessionState({ selectedMarkets: markets });
  };


  // Start chat session
  const startChat = () => {
    saveSessionState({ chatStarted: true });
  };

  // Reset chat session
  const resetChat = () => {
    saveSessionState({ 
      chatStarted: false,
      sessionId: generateSessionId()
    });
  };

  // Update preferences
  const updatePreferences = (preferences: Partial<SessionState['preferences']>) => {
    saveSessionState({ 
      preferences: { ...sessionState.preferences, ...preferences }
    });
  };

  // Clear session
  const clearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const newState = {
        ...DEFAULT_SESSION_STATE,
        sessionId: generateSessionId(),
      };
      setSessionState(newState);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return {
    sessionState,
    isLoaded,
    updateSelectedMarkets,
    startChat,
    resetChat,
    updatePreferences,
    clearSession,
  };
}