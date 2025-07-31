'use client';

import { useState, KeyboardEvent } from 'react';

interface CentralInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CentralInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Wonach suchst du? (Obst, Rezeptideen, Preisvergleiche, etc...)"
}: CentralInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full p-3 sm:p-4 rounded-xl border-2 resize-none focus:outline-none focus:ring-2 transition-all duration-200"
        style={{
          borderColor: 'var(--sparfuchs-border)',
          background: 'var(--sparfuchs-surface)',
          color: 'var(--sparfuchs-text)',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--sparfuchs-primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--sparfuchs-border)';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      <div className="flex justify-center">
        <button 
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="px-6 sm:px-8 py-2 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
          style={{ 
            background: disabled || !input.trim() 
              ? 'var(--sparfuchs-text-light)' 
              : 'var(--sparfuchs-success)',
            minWidth: '100px'
          }}
          onMouseOver={(e) => {
            if (!disabled && input.trim()) {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {disabled ? (
            <div 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"
            ></div>
          ) : (
            '>'
          )}
        </button>
      </div>
    </div>
  );
}