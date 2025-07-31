'use client';

import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
  type: string;
}

export interface FormField {
  value: string;
  touched: boolean;
  errors: ValidationError[];
  isValid: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule>> = {}
) {
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState: FormState = {};
    Object.keys(initialValues).forEach(key => {
      initialState[key] = {
        value: initialValues[key] || '',
        touched: false,
        errors: [],
        isValid: true,
      };
    });
    return initialState;
  });

  // Validate a single field
  const validateField = useCallback((
    fieldName: string, 
    value: string, 
    rules: ValidationRule = {}
  ): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      errors.push({
        field: fieldName,
        message: 'Dieses Feld ist erforderlich',
        type: 'required'
      });
      return errors; // Return early if required field is empty
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return errors;
    }

    const trimmedValue = value.trim();

    // Min length validation
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      errors.push({
        field: fieldName,
        message: `Mindestens ${rules.minLength} Zeichen erforderlich`,
        type: 'minLength'
      });
    }

    // Max length validation
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      errors.push({
        field: fieldName,
        message: `Maximal ${rules.maxLength} Zeichen erlaubt`,
        type: 'maxLength'
      });
    }

    // Word count validations
    const wordCount = trimmedValue.split(/\s+/).filter(word => word.length > 0).length;

    if (rules.minWords && wordCount < rules.minWords) {
      errors.push({
        field: fieldName,
        message: `Mindestens ${rules.minWords} Wörter erforderlich`,
        type: 'minWords'
      });
    }

    if (rules.maxWords && wordCount > rules.maxWords) {
      errors.push({
        field: fieldName,
        message: `Maximal ${rules.maxWords} Wörter erlaubt`,
        type: 'maxWords'
      });
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      errors.push({
        field: fieldName,
        message: 'Ungültiges Format',
        type: 'pattern'
      });
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(trimmedValue);
      if (customError) {
        errors.push({
          field: fieldName,
          message: customError,
          type: 'custom'
        });
      }
    }

    return errors;
  }, []);

  // Update field value and validate
  const updateField = useCallback((fieldName: string, value: string) => {
    const rules = validationRules[fieldName as keyof T] || {};
    const errors = validateField(fieldName, value, rules);

    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        value,
        touched: true,
        errors,
        isValid: errors.length === 0,
      },
    }));
  }, [validationRules, validateField]);

  // Mark field as touched
  const touchField = useCallback((fieldName: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true,
      },
    }));
  }, []);

  // Validate all fields
  const validateAllFields = useCallback(() => {
    const newFormState: FormState = {};
    let isFormValid = true;

    Object.keys(formState).forEach(fieldName => {
      const rules = validationRules[fieldName as keyof T] || {};
      const errors = validateField(fieldName, formState[fieldName].value, rules);
      const isFieldValid = errors.length === 0;

      newFormState[fieldName] = {
        ...formState[fieldName],
        touched: true,
        errors,
        isValid: isFieldValid,
      };

      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    setFormState(newFormState);
    return isFormValid;
  }, [formState, validationRules, validateField]);

  // Reset form
  const resetForm = useCallback(() => {
    const resetState: FormState = {};
    Object.keys(initialValues).forEach(key => {
      resetState[key] = {
        value: initialValues[key] || '',
        touched: false,
        errors: [],
        isValid: true,
      };
    });
    setFormState(resetState);
  }, [initialValues]);

  // Get field value
  const getFieldValue = useCallback((fieldName: string): string => {
    return formState[fieldName]?.value || '';
  }, [formState]);

  // Get field errors
  const getFieldErrors = useCallback((fieldName: string): ValidationError[] => {
    return formState[fieldName]?.errors || [];
  }, [formState]);

  // Check if field has errors
  const hasFieldErrors = useCallback((fieldName: string): boolean => {
    const field = formState[fieldName];
    return field ? field.touched && field.errors.length > 0 : false;
  }, [formState]);

  // Get first error message for field
  const getFieldError = useCallback((fieldName: string): string | null => {
    const field = formState[fieldName];
    if (field && field.touched && field.errors.length > 0) {
      return field.errors[0].message;
    }
    return null;
  }, [formState]);

  // Computed values
  const isFormValid = useMemo(() => {
    return Object.values(formState).every(field => field.isValid);
  }, [formState]);

  const hasAnyErrors = useMemo(() => {
    return Object.values(formState).some(field => field.touched && field.errors.length > 0);
  }, [formState]);

  const touchedFields = useMemo(() => {
    return Object.keys(formState).filter(key => formState[key].touched);
  }, [formState]);

  const formValues = useMemo(() => {
    const values: Record<string, string> = {};
    Object.keys(formState).forEach(key => {
      values[key] = formState[key].value;
    });
    return values as T;
  }, [formState]);

  // Specific validation helpers for chat input
  const chatInputRules: ValidationRule = {
    required: true,
    minLength: 1,
    maxLength: 500,
    maxWords: 100,
    custom: (value: string) => {
      // Check for potentially harmful content
      const suspiciousPatterns = [
        /script/i,
        /javascript/i,
        /eval\(/i,
        /onclick/i,
        /onerror/i,
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          return 'Verdächtiger Inhalt erkannt';
        }
      }
      
      return null;
    }
  };

  return {
    formState,
    formValues,
    isFormValid,
    hasAnyErrors,
    touchedFields,
    updateField,
    touchField,
    validateAllFields,
    resetForm,
    getFieldValue,
    getFieldErrors,
    hasFieldErrors,
    getFieldError,
    chatInputRules,
  };
}