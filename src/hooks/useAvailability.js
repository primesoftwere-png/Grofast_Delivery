// Custom React Hook for Availability Management

import { useState, useCallback } from 'react';
import { deliveryAvailabilityAPI } from '@/lib/api';

export function useAvailability() {
  const [status, setStatus] = useState({
    isOnline: false,
    isAvailable: false,
    isBlocked: false,
    blockReason: null,
    kycStatus: null,
    activeOrder: null,
    wallet: null,
    canGoOnline: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryAvailabilityAPI.getStatus();
      setStatus(response.data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async (isOnline) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryAvailabilityAPI.toggleStatus(isOnline);
      setStatus(prev => ({
        ...prev,
        isOnline: response.data.isOnline,
        isAvailable: response.data.isAvailable,
      }));
      return response;
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goOnline = useCallback(async () => {
    return await toggleStatus(true);
  }, [toggleStatus]);

  const goOffline = useCallback(async () => {
    return await toggleStatus(false);
  }, [toggleStatus]);

  return {
    status,
    isLoading,
    error,
    getStatus,
    toggleStatus,
    goOnline,
    goOffline,
  };
}
