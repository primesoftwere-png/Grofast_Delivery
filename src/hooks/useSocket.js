// Custom React Hook for Socket.IO

import { useEffect, useState, useCallback } from 'react';
import socketService from '@/services/socketService';
import locationService from '@/services/locationService';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Setup listeners
    const handleConnected = (data) => {
      setIsConnected(true);
      setSocketId(data.socketId);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setSocketId(null);
    };

    const handleDeliveryRequest = (data) => {
      setDeliveryRequests(prev => [...prev, data]);
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Delivery Request', {
          body: `Order ${data.orderNumber} - ₹${data.amount}`,
          icon: '/icon.png'
        });
      }
    };

    const handleDeliveryRequestCancelled = (data) => {
      setDeliveryRequests(prev => prev.filter(req => req.orderId !== data.orderId));
    };

    const handleOrderCancelled = (data) => {
      setNotifications(prev => [...prev, {
        type: 'order_cancelled',
        message: `Order ${data.orderNumber} has been cancelled`,
        data,
        timestamp: new Date()
      }]);
    };

    const handleOrderReady = (data) => {
      setNotifications(prev => [...prev, {
        type: 'order_ready',
        message: `Order ${data.orderNumber} is ready for pickup`,
        data,
        timestamp: new Date()
      }]);
    };

    // Register listeners
    socketService.on('socket_connected', handleConnected);
    socketService.on('socket_disconnected', handleDisconnected);
    socketService.on('delivery_request', handleDeliveryRequest);
    socketService.on('delivery_request_cancelled', handleDeliveryRequestCancelled);
    socketService.on('order_cancelled', handleOrderCancelled);
    socketService.on('order_ready_for_pickup', handleOrderReady);

    // Cleanup
    return () => {
      socketService.off('socket_connected', handleConnected);
      socketService.off('socket_disconnected', handleDisconnected);
      socketService.off('delivery_request', handleDeliveryRequest);
      socketService.off('delivery_request_cancelled', handleDeliveryRequestCancelled);
      socketService.off('order_cancelled', handleOrderCancelled);
      socketService.off('order_ready_for_pickup', handleOrderReady);
    };
  }, []);

  const goOnline = useCallback(() => {
    socketService.goOnline();
    locationService.startTracking();
  }, []);

  const goOffline = useCallback(() => {
    socketService.goOffline();
    locationService.stopTracking();
  }, []);

  const joinOrder = useCallback((orderId) => {
    socketService.joinOrder(orderId);
  }, []);

  const leaveOrder = useCallback((orderId) => {
    socketService.leaveOrder(orderId);
  }, []);

  const updateLocation = useCallback((location) => {
    socketService.updateLocation(location);
  }, []);

  const clearDeliveryRequest = useCallback((orderId) => {
    setDeliveryRequests(prev => prev.filter(req => req.orderId !== orderId));
  }, []);

  const clearNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    isConnected,
    socketId,
    deliveryRequests,
    notifications,
    goOnline,
    goOffline,
    joinOrder,
    leaveOrder,
    updateLocation,
    clearDeliveryRequest,
    clearNotification,
    clearAllNotifications,
  };
}
