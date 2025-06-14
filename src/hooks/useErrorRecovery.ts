import { useState, useCallback } from 'react';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

interface ErrorRecoveryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
  canRetry: boolean;
}

export const useErrorRecovery = (options: ErrorRecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    canRetry: true
  });

  const calculateDelay = useCallback((attempt: number): number => {
    if (!exponentialBackoff) return retryDelay;
    return retryDelay * Math.pow(2, attempt - 1);
  }, [retryDelay, exponentialBackoff]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    customOptions?: Partial<ErrorRecoveryOptions>
  ): Promise<T> => {
    const effectiveMaxRetries = customOptions?.maxRetries ?? maxRetries;
    let attempt = 0;

    while (attempt <= effectiveMaxRetries) {
      try {
        setState(prev => ({
          ...prev,
          isRetrying: attempt > 0,
          retryCount: attempt,
          lastError: null
        }));

        const result = await operation();
        
        // Success - reset state
        setState({
          isRetrying: false,
          retryCount: 0,
          lastError: null,
          canRetry: true
        });

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setState(prev => ({
          ...prev,
          lastError: errorObj,
          retryCount: attempt,
          isRetrying: false
        }));

        if (attempt === effectiveMaxRetries) {
          setState(prev => ({
            ...prev,
            canRetry: false
          }));

          if (onMaxRetriesReached) {
            onMaxRetriesReached();
          }
          throw errorObj;
        }

        // Wait before retry
        if (attempt < effectiveMaxRetries) {
          const delay = calculateDelay(attempt + 1);
          
          if (onRetry) {
            onRetry(attempt + 1);
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        }

        attempt++;
      }
    }

    throw new Error('Unexpected error in retry logic');
  }, [maxRetries, onRetry, onMaxRetriesReached, calculateDelay]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setState(prev => ({
      ...prev,
      retryCount: 0,
      canRetry: true,
      lastError: null
    }));

    return executeWithRetry(operation);
  }, [executeWithRetry]);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      canRetry: true
    });
  }, []);

  const handleError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      lastError: error,
      canRetry: prev.retryCount < maxRetries
    }));
  }, [maxRetries]);

  return {
    ...state,
    executeWithRetry,
    retry,
    reset,
    handleError
  };
};
