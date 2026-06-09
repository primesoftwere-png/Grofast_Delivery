// Custom React Hook for Order Management

import { useState } from 'react';
import { deliveryOrderAPI } from '@/lib/api';

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAvailableOrders = async (params = {}) => {
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
  };

  const getAssignedOrders = async (status = null) => {
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
  };

  const acceptOrder = async (orderId) => {
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
  };

  const rejectOrder = async (orderId, reason = '') => {
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
  };

  const getOrderDetails = async (orderId) => {
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
  };

  const markPickedUp = async (orderToken, pickupOTP) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderAPI.markPickedUp(orderToken, pickupOTP);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to mark order as picked up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const startDelivery = async (orderId) => {
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
  };

  const completeDelivery = async (orderId, deliveryOTP) => {
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
  };

  const generatePickupOTP = async (orderId) => {
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
  };

  const generateDeliveryOTP = async (orderId) => {
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
  };

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
