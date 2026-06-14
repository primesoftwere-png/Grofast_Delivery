// Custom React Hook for Order Management

import { useState, useCallback } from 'react';
import { deliveryOrderAPI } from '@/lib/api';

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAvailableOrders = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.getAvailableOrders(params);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch available orders');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAssignedOrders = useCallback(async (status = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.getAssignedOrders(status);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned orders');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptOrder = useCallback(async (orderId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.acceptOrder(orderId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to accept order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectOrder = useCallback(async (orderId, reason = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.rejectOrder(orderId, reason);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to reject order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrderDetails = useCallback(async (orderId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.getOrderDetails(orderId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markPickedUp = useCallback(async (orderId, pickupOTP) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.markPickedUp(orderId, pickupOTP);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to mark order as picked up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startDelivery = useCallback(async (orderId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.startDelivery(orderId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to start delivery');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeDelivery = useCallback(async (orderId, deliveryOTP) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.completeDelivery(orderId, deliveryOTP);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to complete delivery');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePickupOTP = useCallback(async (orderId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.generatePickupOTP(orderId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to generate pickup OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateDeliveryOTP = useCallback(async (orderId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.generateDeliveryOTP(orderId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to generate delivery OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getAvailableOrders,
    getAssignedOrders,
    acceptOrder,
    rejectOrder,
    getOrderDetails,
    markPickedUp,
    startDelivery,
    completeDelivery,
    generatePickupOTP,
    generateDeliveryOTP,
  };
}
