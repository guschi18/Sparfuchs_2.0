'use client';

import { useState, KeyboardEvent } from 'react';
import { InputTip } from '../UI/InputTip';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  isValid?: boolean;
  characterCount?: number;
  maxLength?: number;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Nachricht eingeben...",
  value,
  onChange,
  isValid = true,
  characterCount = 0,
  maxLength = 500
}: ChatInputProps) {
  const [localInput, setLocalInput] = useState('');
  
  // Use controlled or uncontrolled mode
  const inputValue = value !== undefined ? value : localInput;
  const handleInputChange = onChange || setLocalInput;

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      if (value === undefined) {
        setLocalInput('');
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-0">
      <div className="relative">
        <textarea
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full p-2 sm:p-3 rounded-xl border-2 resize-none focus:outline-none focus:ring-2 transition-all duration-200 chat-font"
          style={{
            borderColor: 'var(--sparfuchs-border)',
            background: 'var(--sparfuchs-surface)',
            color: 'var(--sparfuchs-text)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--sparfuchs-success)';
            e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--sparfuchs-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
        
      </div>
      
      {/* Input Tip - über dem Senden Button */}
      <InputTip 
        text=""
        variant="chat"
        className="-mt-2"
      />
      
      <div className="flex justify-center">
        <button 
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className="px-12 sm:px-16 py-2 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed inter-font-medium"
          style={{ 
            background: disabled || !inputValue.trim() 
              ? 'var(--sparfuchs-text-light)' 
              : 'var(--sparfuchs-success)',
            minWidth: '200px'
          }}
          onMouseOver={(e) => {
            if (!disabled && inputValue.trim()) {
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
            'Senden'
          )}
        </button>
      </div>
    </div>
  );
}