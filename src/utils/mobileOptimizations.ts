// Mobile optimization utilities

/**
 * Check if the current device is mobile based on screen width
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Get responsive text size classes based on screen size
 */
export function getResponsiveTextSize(base: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'): string {
  const sizeMap = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-sm sm:text-base lg:text-lg',
    lg: 'text-base sm:text-lg lg:text-xl',
    xl: 'text-lg sm:text-xl lg:text-2xl',
    '2xl': 'text-xl sm:text-2xl lg:text-3xl',
    '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '4xl': 'text-3xl sm:text-4xl lg:text-5xl'
  };
  
  return sizeMap[base] || sizeMap.base;
}

/**
 * Get responsive spacing classes
 */
export function getResponsiveSpacing(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string {
  const spacingMap = {
    xs: 'p-1 sm:p-2',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 lg:p-6',
    lg: 'p-4 sm:p-6 lg:p-8',
    xl: 'p-6 sm:p-8 lg:p-12'
  };
  
  return spacingMap[size] || spacingMap.md;
}

/**
 * Get responsive gap classes
 */
export function getResponsiveGap(size: 'xs' | 'sm' | 'md' | 'lg'): string {
  const gapMap = {
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8'
  };
  
  return gapMap[size] || gapMap.md;
}

/**
 * Get responsive grid columns
 */
export function getResponsiveGrid(mobile: number, tablet: number, desktop: number): string {
  return `grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop}`;
}

/**
 * Get responsive button size classes
 */
export function getResponsiveButtonSize(): string {
  return 'h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm';
}

/**
 * Get responsive icon size classes
 */
export function getResponsiveIconSize(size: 'sm' | 'md' | 'lg'): string {
  const iconMap = {
    sm: 'h-3 w-3 sm:h-4 sm:w-4',
    md: 'h-4 w-4 sm:h-5 sm:w-5',
    lg: 'h-5 w-5 sm:h-6 sm:w-6'
  };
  
  return iconMap[size] || iconMap.md;
}

/**
 * Optimize touch targets for mobile
 */
export function getTouchFriendlyClasses(): string {
  return 'min-h-[44px] min-w-[44px] touch-manipulation';
}

/**
 * Get responsive modal/dialog classes
 */
export function getResponsiveModalClasses(): string {
  return 'w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] m-2 sm:m-4';
}

/**
 * Get responsive card padding
 */
export function getResponsiveCardPadding(): string {
  return 'p-3 sm:p-6';
}

/**
 * Get responsive header padding
 */
export function getResponsiveHeaderPadding(): string {
  return 'p-3 sm:p-6 pb-2 sm:pb-3';
}