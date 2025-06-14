import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: 'wifi' | 'cellular' | 'unknown';
  retryCount: number;
}

interface UseNetworkStatusOptions {
  onConnectionLost?: () => void;
  onConnectionRestored?: () => void;
  slowConnectionThreshold?: number; // milliseconds
  retryInterval?: number; // milliseconds
  maxRetries?: number;
}

export const useNetworkStatus = (options: UseNetworkStatusOptions = {}) => {
  const {
    onConnectionLost,
    onConnectionRestored,
    slowConnectionThreshold = 3000,
    retryInterval = 5000,
    maxRetries = 3
  } = options;

  // Check if we're on the client side
  const isClient = typeof window !== 'undefined';

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: isClient ? navigator.onLine : true, // Default to true on server
    isSlowConnection: false,
    connectionType: 'unknown',
    retryCount: 0
  });
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);  // Check connection speed
  const checkConnectionSpeed = useCallback(async (): Promise<boolean> => {
    if (!isClient) return true; // Skip on server
    
    try {
      const startTime = Date.now();
      // Use a reliable external ping endpoint or test with a small resource
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors'
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return duration < slowConnectionThreshold;
    } catch {
      return false;
    }
  }, [slowConnectionThreshold, isClient]);  // Get connection type
  const getConnectionType = useCallback((): 'wifi' | 'cellular' | 'unknown' => {
    if (!isClient) return 'unknown';
    
    if ('connection' in navigator) {
      const connection = (navigator as { connection?: { type?: string } }).connection;
      if (connection?.type === 'wifi') return 'wifi';
      if (connection?.type === 'cellular') return 'cellular';
    }
    return 'unknown';
  }, [isClient]);  // Handle connection status change
  const handleOnline = useCallback(async () => {
    if (!isClient) return;
    
    const isFastConnection = await checkConnectionSpeed();
    const connectionType = getConnectionType();
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: true,
      isSlowConnection: !isFastConnection,
      connectionType,
      retryCount: 0
    }));

    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }

    if (onConnectionRestored) {
      onConnectionRestored();
    }
  }, [retryTimeout, onConnectionRestored, checkConnectionSpeed, getConnectionType, isClient]);
  const startRetryMechanism = useCallback(() => {
    if (!isClient || retryTimeout) return;

    const retry = () => {
      setNetworkStatus(prev => {
        if (prev.retryCount >= maxRetries) {
          return prev;
        }

        // Try to reconnect
        if (navigator.onLine) {
          handleOnline();
          return prev;
        }

        const newRetryCount = prev.retryCount + 1;
        
        if (newRetryCount < maxRetries) {
          const timeout = setTimeout(retry, retryInterval);
          setRetryTimeout(timeout);
        }

        return {
          ...prev,
          retryCount: newRetryCount
        };
      });
    };

    const timeout = setTimeout(retry, retryInterval);
    setRetryTimeout(timeout);
  }, [retryTimeout, maxRetries, retryInterval, handleOnline, isClient]);
  const handleOffline = useCallback(() => {
    if (!isClient) return;
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: false
    }));

    if (onConnectionLost) {
      onConnectionLost();
    }

    // Start retry mechanism
    startRetryMechanism();
  }, [onConnectionLost, startRetryMechanism, isClient]);
  // Manual retry function
  const retryConnection = useCallback(() => {
    if (!isClient) return;
    
    setNetworkStatus(prev => ({ ...prev, retryCount: 0 }));
    if (navigator.onLine) {
      handleOnline();
    } else {
      startRetryMechanism();
    }
  }, [handleOnline, startRetryMechanism, isClient]);
  useEffect(() => {
    if (!isClient) return;

    // Initial connection check
    handleOnline();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as { connection?: { addEventListener?: (event: string, callback: () => void) => void } }).connection;
      if (connection && typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', handleOnline);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      
      if ('connection' in navigator) {
        const connection = (navigator as { connection?: { removeEventListener?: (event: string, callback: () => void) => void } }).connection;
        if (connection && typeof connection.removeEventListener === 'function') {
          connection.removeEventListener('change', handleOnline);
        }
      }
    };
  }, [handleOffline, handleOnline, retryTimeout, isClient]);

  return {
    ...networkStatus,
    retryConnection
  };
};
