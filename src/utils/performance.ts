// Performance optimization utilities
import { logger } from '@/utils/logger';

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if device has reduced motion preference
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device pixel ratio for high DPI displays
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Check if device is likely a mobile device based on screen size and touch capability
 */
export function isMobileDevice(): boolean {
  return (
    'ontouchstart' in window &&
    window.innerWidth <= 768
  );
}

/**
 * Optimize images for different screen densities
 */
export function getOptimizedImageSrc(baseSrc: string, size: 'sm' | 'md' | 'lg' = 'md'): string {
  const pixelRatio = getDevicePixelRatio();
  const isMobile = isMobileDevice();
  
  // Adjust size based on device
  if (isMobile && size === 'lg') size = 'md';
  if (isMobile && size === 'md') size = 'sm';
  
  // Add pixel ratio suffix for high DPI displays
  if (pixelRatio > 1) {
    const extension = baseSrc.split('.').pop();
    const nameWithoutExtension = baseSrc.replace(`.${extension}`, '');
    return `${nameWithoutExtension}@${Math.ceil(pixelRatio)}x.${extension}`;
  }
  
  return baseSrc;
}

/**
 * Lazy load component with intersection observer
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFunc);
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Memory usage monitoring (development only)
 */
export function logMemoryUsage(): void {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    logger.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    });
  }
}