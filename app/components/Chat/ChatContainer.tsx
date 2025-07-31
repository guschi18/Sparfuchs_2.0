'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatHistory } from '../../../lib/hooks/useChatHistory';
import { useRealTimeUpdates } from '../../../lib/hooks/useRealTimeUpdates';
import { useInputHandling } from '../../../lib/hooks/useInputHandling';
import { useFormValidation } from '../../../lib/hooks/useFormValidation';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatContainerProps {
  selectedMarkets: string[];
  sessionId: string;
  onResetChat?: () => void;
  initialMessage?: string;
}

export function ChatContainer({ 
  selectedMarkets, 
  sessionId,
  onResetChat,
  initialMessage
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { chatHistory, addMessage, updateMessage, isLoaded: historyLoaded } = useChatHistory(sessionId);
  const { realtimeState, startStream, stopStream } = useRealTimeUpdates();
  const { 
    input, 
    inputState, 
    inputRef, 
    handleInputChange, 
    handleSubmit: handleInputSubmit,
    clearInput 
  } = useInputHandling({
    maxLength: 500,
    maxWords: 100,
    preventEmptySubmission: true,
  });
  
  const { chatInputRules } = useFormValidation({ message: '' });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.messages]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && historyLoaded && chatHistory.messages.length === 0) {
      handleSendMessage(initialMessage.trim());
    }
  }, [initialMessage, historyLoaded, chatHistory.messages.length]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || realtimeState.isStreaming) return;

    // Add user message
    const userMessage = addMessage({
      content: content.trim(),
      role: 'user',
    });

    // Clear input
    clearInput();

    // Create assistant message placeholder
    const assistantMessage = addMessage({
      content: '',
      role: 'assistant',
    });

    // Start streaming
    let assistantContent = '';
    try {
      await startStream(
        '/api/chat',
        {
          message: content.trim(),
          selectedMarkets,
        },
        (chunk) => {
          if (chunk.content) {
            assistantContent += chunk.content;
            updateMessage(assistantMessage.id, { content: assistantContent });
          }
        },
        () => {
          // On complete
        },
        (error) => {
          // On error
          updateMessage(assistantMessage.id, {
            content: `Entschuldigung, ein Fehler ist aufgetreten: ${error}`,
          });
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      updateMessage(assistantMessage.id, {
        content: `Entschuldigung, ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
      });
    }
  };

  // Show loading state while history is loading
  if (!historyLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--sparfuchs-primary)' }}
          ></div>
          <p style={{ color: 'var(--sparfuchs-text-light)' }}>
            Chat wird geladen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      {realtimeState.hasError && (
        <div 
          className="p-3 text-sm border-l-4"
          style={{ 
            background: 'rgba(231, 76, 60, 0.1)',
            borderColor: 'var(--sparfuchs-error)',
            color: 'var(--sparfuchs-error)'
          }}
        >
          ⚠️ {realtimeState.errorMessage}
        </div>
      )}

      {/* Chat Messages Area - Streamlit Style */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ background: 'var(--sparfuchs-background)' }}
      >
        {chatHistory.messages.length === 0 && (
          <div className="text-center mt-8" style={{ color: 'var(--sparfuchs-text-light)' }}>
            <p className="text-lg mb-2" style={{ color: 'var(--sparfuchs-primary)' }}>
              Willkommen bei SparFuchs! 🦊
            </p>
            <p>Fragen Sie nach Produkten und Angeboten in deutschen Supermärkten.</p>
          </div>
        )}
        
        {chatHistory.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {realtimeState.isStreaming && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <div 
                className="animate-spin rounded-full h-6 w-6 border-b-2" 
                style={{ borderColor: 'var(--sparfuchs-primary)' }}
              ></div>
              <span style={{ color: 'var(--sparfuchs-text-light)' }}>
                {realtimeState.isConnected ? 'SparFuchs antwortet...' : 'Verbinde...'}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area - Streamlit Style */}
      <div 
        className="p-6"
        style={{ 
          borderTop: '1px solid var(--sparfuchs-border)',
          background: 'var(--sparfuchs-background)'
        }}
      >
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={realtimeState.isStreaming}
          placeholder="Fragen Sie nach Produkten, z.B. 'Welche Milch ist diese Woche günstig?'"
          value={input}
          onChange={handleInputChange}
          isValid={inputState.isValid}
          characterCount={inputState.characterCount}
          maxLength={500}
        />
        
        {/* Chat Reset Button */}
        {onResetChat && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onResetChat}
              disabled={realtimeState.isStreaming}
              className="px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: 'var(--sparfuchs-border)',
                background: 'var(--sparfuchs-surface)',
                color: 'var(--sparfuchs-text-light)',
              }}
              onMouseOver={(e) => {
                if (!realtimeState.isStreaming) {
                  e.currentTarget.style.borderColor = 'var(--sparfuchs-primary)';
                  e.currentTarget.style.color = 'var(--sparfuchs-primary)';
                }
              }}
              onMouseOut={(e) => {
                if (!realtimeState.isStreaming) {
                  e.currentTarget.style.borderColor = 'var(--sparfuchs-border)';
                  e.currentTarget.style.color = 'var(--sparfuchs-text-light)';
                }
              }}
            >
              🔄 Chat zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}