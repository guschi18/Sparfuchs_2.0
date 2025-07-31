'use client';

import { useState, useCallback, useRef } from 'react';

export interface InputState {
  value: string;
  isValid: boolean;
  isEmpty: boolean;
  wordCount: number;
  characterCount: number;
  hasSpecialChars: boolean;
}

export interface InputHandlingOptions {
  minLength?: number;
  maxLength?: number;
  maxWords?: number;
  allowSpecialChars?: boolean;
  trimWhitespace?: boolean;
  preventEmptySubmission?: boolean;
}

const DEFAULT_OPTIONS: Required<InputHandlingOptions> = {
  minLength: 1,
  maxLength: 500,
  maxWords: 100,
  allowSpecialChars: true,
  trimWhitespace: true,
  preventEmptySubmission: true,
};

export function useInputHandling(options: InputHandlingOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [input, setInput] = useState('');
  const [inputState, setInputState] = useState<InputState>({
    value: '',
    isValid: true,
    isEmpty: true,
    wordCount: 0,
    characterCount: 0,
    hasSpecialChars: false,
  });
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Validate input text
  const validateInput = useCallback((text: string): InputState => {
    const trimmedText = opts.trimWhitespace ? text.trim() : text;
    const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(text);
    
    const state: InputState = {
      value: text,
      isEmpty: trimmedText.length === 0,
      wordCount: words.length,
      characterCount: text.length,
      hasSpecialChars,
      isValid: true, // Will be updated below
    };

    // Validate length
    if (trimmedText.length < opts.minLength || trimmedText.length > opts.maxLength) {
      state.isValid = false;
    }

    // Validate word count
    if (words.length > opts.maxWords) {
      state.isValid = false;
    }

    // Validate special characters
    if (!opts.allowSpecialChars && hasSpecialChars) {
      state.isValid = false;
    }

    // Validate empty submission
    if (opts.preventEmptySubmission && state.isEmpty) {
      state.isValid = false;
    }

    return state;
  }, [opts]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    const newState = validateInput(value);
    setInputState(newState);
  }, [validateInput]);

  // Handle key press events
  const handleKeyPress = useCallback((
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    onSubmit?: (text: string) => void
  ) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      }
      
      event.preventDefault();
      
      if (onSubmit && inputState.isValid && !inputState.isEmpty) {
        const submitText = opts.trimWhitespace ? input.trim() : input;
        onSubmit(submitText);
      }
    }
  }, [input, inputState, opts.trimWhitespace]);

  // Handle paste events
  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData('text');
    const currentValue = input;
    const newValue = currentValue + pastedText;
    
    // Check if pasted content would exceed limits
    if (newValue.length > opts.maxLength) {
      event.preventDefault();
      
      // Truncate to max length
      const availableSpace = opts.maxLength - currentValue.length;
      const truncatedPaste = pastedText.substring(0, availableSpace);
      const finalValue = currentValue + truncatedPaste;
      
      handleInputChange(finalValue);
      
      // Position cursor at end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(finalValue.length, finalValue.length);
        }
      }, 0);
    }
  }, [input, opts.maxLength, handleInputChange]);

  // Clear input
  const clearInput = useCallback(() => {
    setInput('');
    setInputState({
      value: '',
      isValid: opts.preventEmptySubmission ? false : true,
      isEmpty: true,
      wordCount: 0,
      characterCount: 0,
      hasSpecialChars: false,
    });
  }, [opts.preventEmptySubmission]);

  // Focus input
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  // Get validation errors
  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (inputState.isEmpty && opts.preventEmptySubmission) {
      errors.push('Nachricht darf nicht leer sein');
    }
    
    if (inputState.characterCount < opts.minLength) {
      errors.push(`Mindestens ${opts.minLength} Zeichen erforderlich`);
    }
    
    if (inputState.characterCount > opts.maxLength) {
      errors.push(`Maximal ${opts.maxLength} Zeichen erlaubt`);
    }
    
    if (inputState.wordCount > opts.maxWords) {
      errors.push(`Maximal ${opts.maxWords} Wörter erlaubt`);
    }
    
    if (!opts.allowSpecialChars && inputState.hasSpecialChars) {
      errors.push('Sonderzeichen sind nicht erlaubt');
    }
    
    return errors;
  }, [inputState, opts]);

  // Submit handler
  const handleSubmit = useCallback((onSubmit: (text: string) => void) => {
    if (inputState.isValid && !inputState.isEmpty) {
      const submitText = opts.trimWhitespace ? input.trim() : input;
      onSubmit(submitText);
      clearInput();
    }
  }, [input, inputState, opts.trimWhitespace, clearInput]);

  return {
    input,
    inputState,
    inputRef,
    handleInputChange,
    handleKeyPress,
    handlePaste,
    handleSubmit,
    clearInput,
    focusInput,
    autoResize,
    getValidationErrors,
  };
}