'use client';

import { useState, KeyboardEvent } from 'react';

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
    <div className="space-y-2">
      <div className="flex gap-3">
        <textarea
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 disabled:cursor-not-allowed transition-all duration-200"
          style={{ 
            minHeight: '48px', 
            maxHeight: '120px',
            border: `2px solid var(--sparfuchs-border)`,
            background: 'var(--sparfuchs-surface)',
            color: 'var(--sparfuchs-text)',
            fontSize: '14px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--sparfuchs-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--sparfuchs-border)';
            e.target.style.boxShadow = 'none';
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className="px-6 py-3 text-white rounded-xl font-medium disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          style={{
            background: disabled || !inputValue.trim()
              ? 'var(--sparfuchs-text-light)' 
              : 'var(--sparfuchs-primary)',
            minWidth: '80px'
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
      
      {/* Character counter */}
      <div className="flex justify-end items-center text-xs">
        <div style={{ color: characterCount > maxLength * 0.8 ? 'var(--sparfuchs-warning)' : 'var(--sparfuchs-text-light)' }}>
          {characterCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}