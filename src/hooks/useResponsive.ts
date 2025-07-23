import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
};

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXs = windowSize.width >= breakpoints.xs;
  const isSm = windowSize.width >= breakpoints.sm;
  const isMd = windowSize.width >= breakpoints.md;
  const isLg = windowSize.width >= breakpoints.lg;
  const isXl = windowSize.width >= breakpoints.xl;
  const is2Xl = windowSize.width >= breakpoints['2xl'];

  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  return {
    windowSize,
    breakpoints: {
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
      is2Xl,
    },
    device: {
      isMobile,
      isTablet,
      isDesktop,
    },
    // Helper functions
    isBelow: (breakpoint: keyof BreakpointConfig) => windowSize.width < breakpoints[breakpoint],
    isAbove: (breakpoint: keyof BreakpointConfig) => windowSize.width >= breakpoints[breakpoint],
  };
}