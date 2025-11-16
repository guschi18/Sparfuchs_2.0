'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

/**
 * Toast Component
 *
 * Individual toast notification with:
 * - Auto-dismiss after duration
 * - Manual dismiss on click
 * - Icon based on type
 * - Slide-in animation from top
 */
function Toast({ toast, onDismiss }: ToastProps) {
  const duration = toast.duration || 3000;

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  // Icon based on type
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  // Background color based on type
  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10b981'; // green-500
      case 'error':
        return '#ef4444'; // red-500
      case 'info':
        return '#3b82f6'; // blue-500
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm cursor-pointer max-w-sm"
      style={{
        backgroundColor: getBackgroundColor(),
      }}
      onClick={() => onDismiss(toast.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0">{getIcon()}</div>

      {/* Message */}
      <p className="text-white text-sm font-medium flex-1">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Schließen"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

/**
 * Toast Container Component
 *
 * Container for all toast notifications.
 * Positioned fixed at bottom-right of screen.
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
