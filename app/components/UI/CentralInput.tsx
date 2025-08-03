'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, Variants } from 'framer-motion';
import { InputTip } from './InputTip';

interface CentralInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CentralInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Wonach suchst du? (Obst, Gemüse, Preisvergleiche, etc...)"
}: CentralInputProps) {
  const [input, setInput] = useState('');

  // Animation configurations
  const containerAnimation: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        delay: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const inputAnimation: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 120
      }
    }
  };

  const buttonAnimation: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        delay: 0.1
      }
    }
  };

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
    <motion.div 
      className="space-y-0"
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
    >
      <motion.textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
        variants={inputAnimation}
        whileFocus={{ scale: 1.02 }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--sparfuchs-success)';
          e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--sparfuchs-border)';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      {/* Input Tip - über dem Senden Button */}
      <InputTip 
        text=""
        variant="main"
        className="-mt-2"
      />
      
      <div className="flex justify-center">
        <motion.button 
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="px-12 sm:px-16 py-2 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed inter-font-medium"
          style={{ 
            background: disabled || !input.trim() 
              ? 'var(--sparfuchs-text-light)' 
              : 'var(--sparfuchs-success)',
            minWidth: '200px'
          }}
          variants={buttonAnimation}
          whileHover={!disabled && input.trim() ? { 
            y: -2,
            scale: 1.05,
            boxShadow: '0 4px 20px rgba(40, 167, 69, 0.3)'
          } : {}}
          whileTap={!disabled && input.trim() ? { scale: 0.95 } : {}}
        >
          {disabled ? (
            <div 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"
            ></div>
          ) : (
            'Senden'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}