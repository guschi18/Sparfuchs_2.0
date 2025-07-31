'use client';

import { useEffect } from 'react';
import { performanceMonitor } from '@/lib/utils/performance';

export function PerformanceReporter() {
  useEffect(() => {
    if (!performanceMonitor) return;

    // Report metrics after initial load
    const reportTimer = setTimeout(() => {
      performanceMonitor?.reportMetrics();
    }, 2000);

    // Report metrics on page unload
    const handleBeforeUnload = () => {
      performanceMonitor?.reportMetrics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(reportTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // This component doesn't render anything
  return null;
}