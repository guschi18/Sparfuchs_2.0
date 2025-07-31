'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface UIErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

export function UIErrorBoundary({ children, componentName = 'Komponente' }: UIErrorBoundaryProps) {
  const fallback = (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <div className="flex items-center">
        <div className="text-red-500 mr-3">⚠️</div>
        <div>
          <h4 className="text-red-800 font-medium text-sm">
            Fehler in {componentName}
          </h4>
          <p className="text-red-600 text-xs mt-1">
            Diese Komponente konnte nicht geladen werden. 
            Versuchen Sie, die Seite neu zu laden.
          </p>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded border border-red-300 transition-colors"
      >
        Neu laden
      </button>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.error(`UI Error in ${componentName}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}