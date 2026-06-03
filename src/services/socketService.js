// Socket.IO Service for Delivery Boy App
// Complete implementation for real-time order flow

import { io } from 'socket.io-client';
import { getAuthToken } from '@/lib/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to Socket.IO server
   */
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const token = getAuthToken();
    
    if (!token) {
      console.error('❌ No auth token found');
      return null;
    }

    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    console.log('🔌 Connecting to Socket.IO server:', serverUrl);

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      extraHeaders: {
        authorization: `Bearer ${token}`
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventListeners();
    return this.socket;
  }

  /**
   * Setup default event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // ==================== CONNECTION EVENTS ====================
    
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket_connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('socket_disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      this.emit('socket_error', { error: error.message });
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt:', attemptNumber);
    });

    // ==================== DELIVERY BOY SPECIFIC EVENTS ====================
    
    /**
     * New order available (after shopkeeper accepts)
     * Emitted to all delivery boys in delivery-room
     */
    this.socket.on('order-available', (data) => {
      console.log('📦 New order available:', data);
      this.emit('order_available', data);
    });

    /**
     * Order taken by another delivery boy
     * Emitted to delivery-room after someone accepts the order
     */
    this.socket.on('order-taken', (data) => {
      console.log('❌ Order taken by another delivery boy:', data);
      this.emit('order_taken', data);
    });

    /**
     * Order assignment success
     * Emitted after delivery boy accepts order
     */
    this.socket.on('delivery-accept-success', (data) => {
      console.log('✅ Order assigned successfully:', data);
      console.log('🔑 Pickup OTP:', data.otp);
      this.emit('order_assigned', data);
    });

    /**
     * Online status confirmation
     * Emitted after go-online or go-offline
     */
    this.socket.on('online-status', (data) => {
      console.log('📊 Online status updated:', data);
      this.emit('online_status_updated', data);
    });

    /**
     * Error events from server
     */
    this.socket.on('error', (data) => {
      console.error('❌ Server error:', data);
      this.emit('socket_error', data);
    });

    // ==================== LEGACY EVENTS (Backward Compatibility) ====================
    
    this.socket.on('delivery_request', (data) => {
      console.log('📦 Delivery request (legacy):', data);
      this.emit('delivery_request', data);
    });

    this.socket.on('delivery_request_cancelled', (data) => {
      console.log('❌ Delivery request cancelled:', data);
      this.emit('delivery_request_cancelled', data);
    });

    this.socket.on('order_ready_for_pickup', (data) => {
      console.log('✅ Order ready for pickup:', data);
      this.emit('order_ready_for_pickup', data);
    });

    this.socket.on('order_cancelled', (data) => {
      console.log('❌ Order cancelled:', data);
      this.emit('order_cancelled', data);
    });

    this.socket.on('status_updated', (data) => {
      console.log('📊 Status updated:', data);
      this.emit('status_updated', data);
    });

    this.socket.on('delivery_boy_location_update', (data) => {
      console.log('📍 Location update confirmed:', data);
      this.emit('location_update_confirmed', data);
    });

    // ==================== CHAT EVENTS ====================
    
    this.socket.on('new_message', (data) => {
      console.log('💬 New message:', data);
      this.emit('new_message', data);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stop_typing', (data) => {
      this.emit('user_stop_typing', data);
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('✅ Socket disconnected');
    }
  }

  // ==================== DELIVERY BOY ACTIONS ====================

  /**
   * Accept delivery order
   * @param {string} orderId - Order ID
   */
  acceptOrder(orderId) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected. Cannot accept order.');
      return false;
    }

    console.log('📤 Emitting delivery-accept:', orderId);
    this.socket.emit('delivery-accept', { orderId });
    return true;
  }

  /**
   * Update location
   * @param {Object} locationData - { orderId, lat, lng, speed, heading, accuracy }
   */
  updateLocation(locationData) {
    if (!this.socket || !this.isConnected) {
      // Don't log error for location updates (too noisy)
      return false;
    }

    this.socket.emit('location-update', locationData);
    return true;
  }

  /**
   * Go online
   */
  goOnline() {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected. Cannot go online.');
      return false;
    }

    console.log('📤 Emitting go-online');
    this.socket.emit('go-online');
    return true;
  }

  /**
   * Go offline
   */
  goOffline() {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected. Cannot go offline.');
      return false;
    }

    console.log('📤 Emitting go-offline');
    this.socket.emit('go-offline');
    return true;
  }

  /**
   * Join order room (for chat)
   * @param {string} orderId - Order ID
   */
  joinOrder(orderId) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected. Cannot join order room.');
      return false;
    }

    console.log('🚪 Joining order room:', orderId);
    this.socket.emit('join_order', orderId);
    return true;
  }

  /**
   * Leave order room (for chat)
 
   */
  leaveOrder(orderId) {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    console.log('🚪 Leaving order room:', orderId);
    this.socket.emit('leave_order', orderId);
    return true;
  }

  /**
   * Send typing indicator
   * @param {string} orderId - Order ID
   * @param {string} userName - User name
   */
  sendTyping(orderId, userName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { orderId, userName });
    }
  }

  /**
   * Send stop typing indicator
   * @param {string} orderId - Order ID
   */
  sendStopTyping(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_typing', { orderId });
    }
  }

  // ==================== EVENT MANAGEMENT ====================

  /**
   * Subscribe to events
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * Unsubscribe from events
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function (optional)
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      // Remove all listeners for this event
      this.listeners.delete(eventName);
    }
  }

  /**
   * Emit events to local listeners
   * @param {string} eventName - Event name
   * @param {any} data - Event data
   */
  emit(eventName, data) {
    if (!this.listeners.has(eventName)) return;
    
    const callbacks = this.listeners.get(eventName);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in event listener for ${eventName}:`, error);
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get socket instance
   * @returns {Socket|null}
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket ID
   * @returns {string|null}
   */
  getSocketId() {
    return this.socket?.id || null;
  }

  /**
   * Get connection status
   * @returns {Object}
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create and export singleton instance
const socketService = new SocketService();
export default socketService;
