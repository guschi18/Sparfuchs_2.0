'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface ChatErrorBoundaryProps {
  children: ReactNode;
}

export function ChatErrorBoundary({ children }: ChatErrorBoundaryProps) {
  const fallback = (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">💬🔧</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chat-Fehler
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Der Chat-Bereich konnte nicht geladen werden. 
          Versuchen Sie es erneut oder starten Sie eine neue Unterhaltung.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Chat neu starten
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.error('Chat Error:', error, errorInfo);
        // Could send specific chat errors to analytics
      }}
    >
      {children}
    </ErrorBoundary>
  );
}