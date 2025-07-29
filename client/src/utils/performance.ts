// Performance monitoring utilities

export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
}

// Track render performance
export function measureRenderTime<T>(componentName: string, renderFn: () => T): T {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

// Report Core Web Vitals
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // In production, you would send this to your analytics service
  // Example: analytics.track('Web Vital', metric);
}

// Memory usage tracking
export function getMemoryUsage(): number | undefined {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return undefined;
}

// Bundle size analysis (client-side)
export function logBundleInfo() {
  if (process.env.NODE_ENV === 'development') {
    console.group('Bundle Analysis');
    console.log('Main bundle loaded');
    console.log('Memory usage:', getMemoryUsage(), 'bytes');
    console.groupEnd();
  }
}

// Performance observer for LCP, FID, CLS
export function initPerformanceObserver() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportWebVitals({
          name: 'LCP',
          value: lastEntry.startTime,
          delta: lastEntry.startTime,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportWebVitals({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            delta: entry.processingStart - entry.startTime,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        reportWebVitals({
          name: 'CLS',
          value: clsValue,
          delta: clsValue,
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }
}