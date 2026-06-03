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
  // deliveryRequests = incoming orders available for this delivery boy to accept/reject
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

    // ==================== CONNECTION EVENTS ====================
    const handleConnected = (data) => {
      setIsConnected(true);
      console.log('✅ Socket connected:', data.socketId);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    };

    // ==================== NEW ORDER AVAILABLE (from shopkeeper accepting) ====================
    // Backend emits 'order-available' → socketService maps to 'order_available'
    const handleOrderAvailable = (data) => {
      console.log('📦 New order available via socket:', data);
      setDeliveryRequests(prev => {
        // Avoid duplicates
        const orderId = data.orderId?.toString() || data._id?.toString();
        if (prev.some(req => req.orderId?.toString() === orderId)) {
          return prev;
        }
        return [...prev, { ...data, orderId: orderId, receivedAt: Date.now() }];
      });

      // Show browser notification
      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        new Notification('🚚 New Delivery Available!', {
          body: `Order ${data.orderNumber || ''} • ₹${data.totalAmount || data.estimatedEarnings || ''} • ${data.distance || ''}`,
          icon: '/icon.png',
          tag: data.orderId?.toString()
        });
      }

      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play skipped:', e));
      } catch (e) {
        // Silent fail
      }
    };

    // ==================== ORDER TAKEN (another delivery boy accepted) ====================
    const handleOrderTaken = (data) => {
      console.log('❌ Order taken by another delivery boy:', data);
      const orderId = data.orderId?.toString();
      setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId));
      setNotifications(prev => [...prev, {
        type: 'info',
        title: 'Order Taken',
        message: `Order ${data.orderNumber || ''} was taken by another delivery partner`,
        timestamp: new Date()
      }]);
    };

    // ==================== LEGACY EVENTS (Backward Compatibility) ====================
    const handleDeliveryRequest = (data) => {
      console.log('📦 Delivery request (legacy):', data);
      setDeliveryRequests(prev => {
        const orderId = data.orderId?.toString();
        if (prev.some(req => req.orderId?.toString() === orderId)) return prev;
        return [...prev, { ...data, orderId, receivedAt: Date.now() }];
      });
    };

    const handleDeliveryRequestCancelled = (data) => {
      console.log('❌ Delivery request cancelled:', data);
      setDeliveryRequests(prev => prev.filter(req => req.orderId !== data.orderId));
      setNotifications(prev => [...prev, {
        type: 'info',
        title: 'Request Cancelled',
        message: data.reason || 'Delivery request was cancelled',
        timestamp: new Date()
      }]);
    };

    const handleOrderCancelled = (data) => {
      console.log('❌ Order cancelled:', data);
      // Remove from delivery requests if it was there
      const orderId = data.orderId?.toString();
      setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId));
      setNotifications(prev => [...prev, {
        type: 'warning',
        title: 'Order Cancelled',
        message: `Order ${data.orderNumber || ''} has been cancelled`,
        data,
        timestamp: new Date()
      }]);
    };

    const handleOrderReady = (data) => {
      console.log('✅ Order ready for pickup:', data);
      setNotifications(prev => [...prev, {
        type: 'success',
        title: 'Order Ready for Pickup',
        message: `Order ${data.orderNumber || ''} is ready for pickup from the shop`,
        data,
        timestamp: new Date()
      }]);
    };

    const handleOrderAssigned = (data) => {
      console.log('✅ Order assigned to you:', data);
      // Remove from delivery requests
      const orderId = data.orderId?.toString();
      setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId));
      setNotifications(prev => [...prev, {
        type: 'success',
        title: 'Order Accepted!',
        message: `You accepted order ${data.orderNumber || ''}. Go to the shop for pickup.`,
        data,
        timestamp: new Date()
      }]);
    };

    const handleStatusUpdated = (data) => {
      console.log('📊 Status updated:', data);
      setNotifications(prev => [...prev, {
        type: 'info',
        title: 'Status Updated',
        message: `You are now ${data.status || data.isOnline ? 'Online' : 'Offline'}`,
        timestamp: new Date()
      }]);
    };

    const handleError = (data) => {
      console.error('❌ Socket error:', data);
      setNotifications(prev => [...prev, {
        type: 'error',
        title: 'Error',
        message: data.message || 'An error occurred',
        timestamp: new Date()
      }]);
    };

    // ==================== REGISTER ALL LISTENERS ====================
    socketService.on('socket_connected', handleConnected);
    socketService.on('socket_disconnected', handleDisconnected);
    
    // Real-time order flow (new)
    socketService.on('order_available', handleOrderAvailable);    // Shopkeeper accepted → notify delivery boys
    socketService.on('order_taken', handleOrderTaken);            // Another delivery boy accepted
    socketService.on('order_assigned', handleOrderAssigned);      // This delivery boy accepted
    
    // Legacy events
    socketService.on('delivery_request', handleDeliveryRequest);
    socketService.on('delivery_request_cancelled', handleDeliveryRequestCancelled);
    socketService.on('order_cancelled', handleOrderCancelled);
    socketService.on('order_ready_for_pickup', handleOrderReady);
    socketService.on('status_updated', handleStatusUpdated);
    socketService.on('online_status_updated', handleStatusUpdated);
    socketService.on('socket_error', handleError);

    // Request notification permission
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socketService.off('socket_connected', handleConnected);
      socketService.off('socket_disconnected', handleDisconnected);
      socketService.off('order_available', handleOrderAvailable);
      socketService.off('order_taken', handleOrderTaken);
      socketService.off('order_assigned', handleOrderAssigned);
      socketService.off('delivery_request', handleDeliveryRequest);
      socketService.off('delivery_request_cancelled', handleDeliveryRequestCancelled);
      socketService.off('order_cancelled', handleOrderCancelled);
      socketService.off('order_ready_for_pickup', handleOrderReady);
      socketService.off('status_updated', handleStatusUpdated);
      socketService.off('online_status_updated', handleStatusUpdated);
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
