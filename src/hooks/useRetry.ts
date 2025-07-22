import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
}

export const useRetry = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null
  });

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setRetryState({
          isRetrying: attempt > 1,
          attempt,
          lastError: null
        });

        const result = await fn(...args);
        
        setRetryState({
          isRetrying: false,
          attempt: 0,
          lastError: null
        });
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        setRetryState({
          isRetrying: true,
          attempt,
          lastError
        });

        if (attempt < maxAttempts) {
          onRetry?.(attempt, lastError);
          
          const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise(resolve => setTimeout(resolve, currentDelay));
        }
      }
    }

    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: lastError!
    });

    throw lastError!;
  }, [fn, maxAttempts, delay, backoff, onRetry]);

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: null
    });
  }, []);

  return {
    execute: executeWithRetry,
    reset,
    ...retryState
  };
};