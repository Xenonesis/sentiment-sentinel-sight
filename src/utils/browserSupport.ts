/**
 * Utility functions to check browser capabilities for AI model loading
 */

/**
 * Checks if the browser supports WebAssembly, which is required for ONNX runtime
 */
export const checkWebAssemblySupport = (): boolean => {
  try {
    // Check if WebAssembly is defined
    if (typeof WebAssembly === 'object' && 
        typeof WebAssembly.instantiate === 'function') {
      
      // Try to instantiate a simple module
      const module = new WebAssembly.Module(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
      ]));
      
      if (module instanceof WebAssembly.Module) {
        const instance = new WebAssembly.Instance(module);
        return instance instanceof WebAssembly.Instance;
      }
    }
  } catch (e) {
    return false;
  }
  
  return false;
};

/**
 * Checks if the browser has sufficient memory for model loading
 */
export const checkMemoryAvailability = (): boolean => {
  try {
    // Check if performance.memory is available (Chrome only)
    if (
      // @ts-ignore - performance.memory is not in the standard TypeScript types
      window.performance && 
      // @ts-ignore
      window.performance.memory && 
      // @ts-ignore
      window.performance.memory.jsHeapSizeLimit
    ) {
      // @ts-ignore
      const heapSizeLimit = window.performance.memory.jsHeapSizeLimit;
      // Need at least 512MB for comfortable model loading
      return heapSizeLimit > 512 * 1024 * 1024;
    }
    
    // If we can't check, assume it's sufficient
    return true;
  } catch (e) {
    // If we can't check, assume it's sufficient
    return true;
  }
};

/**
 * Gets diagnostic information about the browser environment
 */
export const getDiagnosticInfo = (): Record<string, any> => {
  return {
    userAgent: navigator.userAgent,
    webAssemblySupport: checkWebAssemblySupport(),
    isOnline: navigator.onLine,
    language: navigator.language,
    // @ts-ignore - deviceMemory is not in the standard TypeScript types
    deviceMemory: navigator.deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    // @ts-ignore - connection is not in the standard TypeScript types
    connectionType: navigator.connection?.type || 'unknown',
    // @ts-ignore - connection is not in the standard TypeScript types
    connectionEffectiveType: navigator.connection?.effectiveType || 'unknown',
    // @ts-ignore - connection is not in the standard TypeScript types
    connectionDownlink: navigator.connection?.downlink || 'unknown',
    // @ts-ignore - connection is not in the standard TypeScript types
    connectionRtt: navigator.connection?.rtt || 'unknown',
  };
};