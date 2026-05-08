'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import socketService from '@/services/socketService';
import locationService from '@/services/locationService';
import { isAuthenticated } from '@/lib/api';

const SocketContext = createContext(null);

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Only connect if authenticated and not on auth pages
    const authPages = ['/login', '/register', '/verify-email'];
    if (!isAuthenticated() || authPages.includes(pathname)) {
      return;
    }

    // Connect to socket
    socketService.connect();

    // Setup event listeners
    const handleConnected = (data) => {
      setIsConnected(true);
      console.log('Socket connected:', data.socketId);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const handleDeliveryRequest = (data) => {
      console.log('New delivery request received:', data);
      setDeliveryRequests(prev => {
        // Avoid duplicates
        if (prev.some(req => req.orderId === data.orderId)) {
          return prev;
        }
        return [...prev, data];
      });

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('🚚 New Delivery Request', {
          body: `Order ${data.orderNumber}\n₹${data.amount} • ${data.distance?.toFixed(1)} km`,
          icon: '/icon.png',
          tag: data.orderId
        });
      }

      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio error:', e);
      }
    };

    const handleDeliveryRequestCancelled = (data) => {
      console.log('Delivery request cancelled:', data);
      setDeliveryRequests(prev => prev.filter(req => req.orderId !== data.orderId));
      
      setNotifications(prev => [...prev, {
        type: 'info',
        title: 'Request Cancelled',
        message: data.reason || 'Delivery request was cancelled',
        timestamp: new Date()
      }]);
    };

    const handleOrderCancelled = (data) => {
      console.log('Order cancelled:', data);
      setNotifications(prev => [...prev, {
        type: 'warning',
        title: 'Order Cancelled',
        message: `Order ${data.orderNumber} has been cancelled`,
        data,
        timestamp: new Date()
      }]);
    };

    const handleOrderReady = (data) => {
      console.log('Order ready for pickup:', data);
      setNotifications(prev => [...prev, {
        type: 'success',
        title: 'Order Ready',
        message: `Order ${data.orderNumber} is ready for pickup`,
        data,
        timestamp: new Date()
      }]);
    };

    const handleStatusUpdated = (data) => {
      console.log('Status updated:', data);
      setNotifications(prev => [...prev, {
        type: 'info',
        title: 'Status Updated',
        message: `You are now ${data.status}`,
        timestamp: new Date()
      }]);
    };

    const handleError = (data) => {
      console.error('Socket error:', data);
      setNotifications(prev => [...prev, {
        type: 'error',
        title: 'Error',
        message: data.message || 'An error occurred',
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
    socketService.on('status_updated', handleStatusUpdated);
    socketService.on('socket_error', handleError);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socketService.off('socket_connected', handleConnected);
      socketService.off('socket_disconnected', handleDisconnected);
      socketService.off('delivery_request', handleDeliveryRequest);
      socketService.off('delivery_request_cancelled', handleDeliveryRequestCancelled);
      socketService.off('order_cancelled', handleOrderCancelled);
      socketService.off('order_ready_for_pickup', handleOrderReady);
      socketService.off('status_updated', handleStatusUpdated);
      socketService.off('socket_error', handleError);
      
      // Disconnect socket
      socketService.disconnect();
      locationService.stopTracking();
    };
  }, [pathname]);

  const value = {
    isConnected,
    deliveryRequests,
    notifications,
    setDeliveryRequests,
    setNotifications,
    socketService,
    locationService
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
