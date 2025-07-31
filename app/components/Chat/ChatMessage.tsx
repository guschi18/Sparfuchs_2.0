'use client';

import { Message } from './ChatContainer';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-xl px-5 py-3 shadow-sm ${
          isUser 
            ? 'text-white' 
            : 'text-gray-800'
        }`}
        style={{
          background: isUser 
            ? 'var(--sparfuchs-primary)' 
            : 'var(--sparfuchs-border)',
          border: isUser 
            ? 'none' 
            : '1px solid var(--sparfuchs-border)'
        }}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
        
        
        <div 
          className={`text-xs mt-2 ${
            isUser ? 'text-white/70' : ''
          }`}
          style={{ 
            color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--sparfuchs-text-light)' 
          }}
        >
          {message.timestamp.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}