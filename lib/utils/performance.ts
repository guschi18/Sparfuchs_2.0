/**
 * Performance monitoring utilities for SparFuchs Next.js app
 */

export interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  interactionToNextPaint: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // Performance Observer for Web Vitals
    if ('PerformanceObserver' in window) {
      // FCP and LCP
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      
      try {
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('Paint observer not supported:', error);
      }

      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }

    // Navigation timing for TTFB
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.timeToFirstByte = navigation.responseStart - navigation.requestStart;
        }
      });
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public reportMetrics(): void {
    const metrics = this.getMetrics();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics');
      console.table(metrics);
      console.groupEnd();
    }

    // Could send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metrics);
    }
  }

  private sendToAnalytics(metrics: Partial<PerformanceMetrics>): void {
    // Placeholder for analytics integration
    // Could integrate with Vercel Analytics, Google Analytics, etc.
    // Analytics metrics collected
  }

  public measureCustomTiming(name: string, startTime: number): number {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      // Performance measurement completed
    }
    
    return duration;
  }

  public startTimer(name: string): () => number {
    const startTime = performance.now();
    return () => this.measureCustomTiming(name, startTime);
  }
}

// Export singleton instance
export const performanceMonitor = typeof window !== 'undefined' 
  ? PerformanceMonitor.getInstance() 
  : null;

// Utility function for measuring async operations
export async function measureAsync<T>(
  name: string, 
  operation: () => Promise<T>
): Promise<T> {
  if (!performanceMonitor) return operation();
  
  const endTimer = performanceMonitor.startTimer(name);
  try {
    const result = await operation();
    endTimer();
    return result;
  } catch (error) {
    endTimer();
    throw error;
  }
}

// Core Web Vitals scoring
export function getWebVitalScore(metric: keyof PerformanceMetrics, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<keyof PerformanceMetrics, [number, number]> = {
    timeToFirstByte: [800, 1800],
    firstContentfulPaint: [1800, 3000],
    largestContentfulPaint: [2500, 4000],
    cumulativeLayoutShift: [0.1, 0.25],
    firstInputDelay: [100, 300],
    interactionToNextPaint: [200, 500],
  };

  const [good, poor] = thresholds[metric];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}