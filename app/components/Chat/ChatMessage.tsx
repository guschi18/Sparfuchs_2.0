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
        className="max-w-[80%] rounded-xl px-5 py-3 shadow-sm chat-font"
        style={{
          background: isUser 
            ? 'rgba(255, 107, 53, 0.9)' 
            : 'var(--sparfuchs-surface)',
          border: isUser 
            ? 'none' 
            : '1px solid var(--sparfuchs-border)',
          color: 'var(--sparfuchs-text)'
        }}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
        
        
        <div 
          className="text-xs mt-2"
          style={{ 
            color: 'var(--sparfuchs-text-light)'
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