// Location Tracking Service

import socketService from './socketService';

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.currentLocation = null;
    this.updateInterval = null;
  }

  /**
   * Start location tracking
   * @param {number} interval - Update interval in milliseconds (default: 5000)
   */
  startTracking(interval = 5000) {
    if (this.isTracking) {
      console.log('Location tracking already started');
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    this.isTracking = true;

    // Watch position continuously
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.handleLocationUpdate(position);
      },
      (error) => {
        this.handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Also update at regular intervals
    this.updateInterval = setInterval(() => {
      this.getCurrentLocation();
    }, interval);

    console.log('📍 Location tracking started');
  }

  /**
   * Stop location tracking
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
    console.log('📍 Location tracking stopped');
  }

  /**
   * Get current location once
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handleLocationUpdate(position);
          resolve(this.currentLocation);
        },
        (error) => {
          this.handleLocationError(error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Handle location update
   * @param {GeolocationPosition} position - Position object
   */
  handleLocationUpdate(position) {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;

    this.currentLocation = {
      lat: latitude,
      lng: longitude,
      accuracy: accuracy,
      speed: speed,
      heading: heading,
      timestamp: new Date(position.timestamp)
    };

    console.log('📍 Location updated:', this.currentLocation);

    // Send location to server via socket
    const activeOrderId = this.getActiveOrderId();
    if (activeOrderId && socketService.isSocketConnected()) {
      socketService.updateLocation({
        orderId: activeOrderId,
        lat: latitude,
        lng: longitude,
        speed: speed,
        heading: heading,
        accuracy: accuracy
      });
    }

    // Emit event for local listeners
    if (socketService.emit) {
      socketService.emit('location_updated', this.currentLocation);
    }
  }

  /**
   * Handle location error
   * @param {GeolocationPositionError} error
   */
  handleLocationError(error) {
    let errorMessage = 'Unknown error';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    console.error('Location error:', errorMessage);
    
    if (socketService.emit) {
      socketService.emit('location_error', { message: errorMessage, code: error.code });
    }
  }

  /**
   * Get active order ID from localStorage
   */
  getActiveOrderId() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeOrderId');
    }
    return null;
  }

  /**
   * Set active order ID
   * @param {string} orderId - Order ID
   */
  setActiveOrderId(orderId) {
    if (typeof window !== 'undefined') {
      if (orderId) {
        localStorage.setItem('activeOrderId', orderId);
      } else {
        localStorage.removeItem('activeOrderId');
      }
    }
  }

  /**
   * Get current location data
   */
  getLocation() {
    return this.currentLocation;
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive() {
    return this.isTracking;
  }

  /**
   * Request location permission
   */
  async requestPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission query error:', error);
      return 'unknown';
    }
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;
