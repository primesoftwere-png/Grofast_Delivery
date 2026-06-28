// API Configuration and Helper Functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

/**
 * Generic API request handler
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        errors: data.errors || [],
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 500,
      message: 'Network error. Please check your connection.',
      errors: [],
    };
  }
}

/**
 * Delivery Boy Authentication APIs
 */
export const deliveryAuthAPI = {
  /**
   * Register a new delivery boy
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} Registration response with user, deliveryBoy, wallet, and token
   */
  register: async (data) => {
    const response = await apiRequest('/api/delivery/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store token in localStorage
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', 'deliveryBoy');
      localStorage.setItem('userId', response.data.user._id);
    }

    return response;
  },

  /**
   * Login delivery boy
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response with user, deliveryBoy, kycStatus, and token
   */
  login: async (email, password) => {
    const response = await apiRequest('/api/delivery/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token and user data in localStorage
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', 'deliveryBoy');
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('accountStatus', response.data.user.accountStatus);
      localStorage.setItem('kycStatus', response.data.kycStatus);
    }

    return response;
  },

  /**
   * Verify email with OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Verification response
   */
  verifyEmail: async (email, otp) => {
    return await apiRequest('/api/delivery/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  /**
   * Logout delivery boy
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    try {
      const response = await apiRequest('/api/delivery/auth/logout', {
        method: 'POST',
      });

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('accountStatus');
      localStorage.removeItem('kycStatus');

      return response;
    } catch (error) {
      // Clear localStorage even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('accountStatus');
      localStorage.removeItem('kycStatus');
      
      throw error;
    }
  },

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<Object>} Response
   */
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

/**
 * Get current user role
 */
export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userRole');
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

/**
 * Get user account status
 */
export const getAccountStatus = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accountStatus');
};

/**
 * Get KYC status
 */
export const getKYCStatus = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kycStatus');
};

/**
 * Delivery Boy Order Management APIs
 */
export const deliveryOrderAPI = {
  /**
   * Get available orders (nearby orders)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Available orders
   */
  getAvailableOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/delivery/orders/available${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get assigned orders
   * @param {string} status - Optional status filter
   * @returns {Promise<Object>} Assigned orders
   */
  getAssignedOrders: async (status = null) => {
    const endpoint = `/api/delivery/orders/assigned${status ? `?status=${status}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Accept an order
   * @param {string} orderId - Order ID to accept
   * @returns {Promise<Object>} Accepted order details
   */
  acceptOrder: async (orderId) => {
    return await apiRequest('/api/delivery/orders/accept', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  /**
   * Reject an order
   * @param {string} orderId - Order ID to reject
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Rejection response
   */
  rejectOrder: async (orderId, reason = '') => {
    return await apiRequest('/api/delivery/orders/reject', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    });
  },

  /**
   * Get order details
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details with items
   */
  getOrderDetails: async (orderId) => {
    return await apiRequest(`/api/delivery/orders/${orderId}`, {
      method: 'GET',
    });
  },

  /**
   * Mark order as picked up (with OTP)
   * @param {string} orderId - Order ID
   * @param {string} pickupOTP - 6-digit OTP from shopkeeper
   * @returns {Promise<Object>} Updated order
   */
  markPickedUp: async (orderId, pickupOTP) => {
    return await apiRequest('/api/delivery/orders/pickup', {
      method: 'POST',
      body: JSON.stringify({ orderId: orderId, pickupOTP }),
    });
  },

  /**
   * Start delivery
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  startDelivery: async (orderId) => {
    return await apiRequest('/api/delivery/orders/start-delivery', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  /**
   * Complete delivery (with OTP)
   * @param {string} orderId - Order ID
   * @param {string} deliveryOTP - 6-digit OTP from customer
   * @returns {Promise<Object>} Completed order
   */
  completeDelivery: async (orderId, deliveryOTP) => {
    return await apiRequest('/api/delivery/orders/complete', {
      method: 'POST',
      body: JSON.stringify({ orderId, deliveryOTP }),  // Send orderId (not orderToken)
    });
  },

  /**
   * Generate pickup OTP (Testing/Admin)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} OTP details
   */
  generatePickupOTP: async (orderId) => {
    return await apiRequest('/api/delivery/orders/otp/pickup', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  /**
   * Generate delivery OTP (Testing/Admin)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} OTP details
   */
  generateDeliveryOTP: async (orderId) => {
    return await apiRequest('/api/delivery/orders/otp/delivery', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },
};

/**
 * Delivery Boy Availability APIs
 */
export const deliveryAvailabilityAPI = {
  /**
   * Toggle online/offline status
   * @param {boolean} isOnline - true to go online, false to go offline
   * @returns {Promise<Object>} Updated status
   */
  toggleStatus: async (isOnline) => {
    return await apiRequest('/api/delivery/availability/toggle', {
      method: 'POST',
      body: JSON.stringify({ isOnline }),
    });
  },

  /**
   * Get current availability status
   * @returns {Promise<Object>} Current status details
   */
  getStatus: async () => {
    return await apiRequest('/api/delivery/availability/status', {
      method: 'GET',
    });
  },
};

/**
 * Delivery Boy Profile APIs
 */
export const deliveryProfileAPI = {
  /**
   * Get Delivery Boy Profile
   * @returns {Promise<Object>} Profile data
   */
  getProfile: async () => {
    return await apiRequest('/api/delivery/profile', {
      method: 'GET',
    });
  },

  /**
   * Update Delivery Boy Profile
   * @param {Object} data - Profile updates
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: async (data) => {
    return await apiRequest('/api/delivery/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};

/**
 * Delivery Boy Wallet & Income APIs
 */
export const deliveryWalletAPI = {
  /**
   * Get Pure Income Data
   * @param {Object} params - Query params like startDate, endDate
   * @returns {Promise<Object>} Income stats
   */
  getIncome: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/delivery/income${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get Income Dashboard Data (Wallet Dashboard)
   * @param {Object} params - Query params like startDate, endDate
   * @returns {Promise<Object>} Dashboard stats
   */
  getIncomeDashboard: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/delivery/wallet/dashboard${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get Wallet Balance
   * @returns {Promise<Object>} Balance details
   */
  getWalletBalance: async () => {
    return await apiRequest('/api/delivery/wallet/balance', {
      method: 'GET',
    });
  },

  /**
   * Add Balance to Wallet (Simulated)
   * @param {Object} data - { amount, description }
   * @returns {Promise<Object>} Added balance details
   */
  addBalance: async (data) => {
    return await apiRequest('/api/delivery/wallet/add-balance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get Wallet Transactions
   * @param {Object} params - Query params like page, limit, transactionType
   * @returns {Promise<Object>} Transactions list
   */
  getTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/delivery/wallet/transactions${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  },

  requestSettlement: async (data) => {
    return await apiRequest('/api/delivery/settlement/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get Settlement History
   * @param {Object} params - Query params like page, limit, status
   * @returns {Promise<Object>} Settlement history
   */
  getSettlementHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/delivery/settlement/history${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, {
      method: 'GET',
    });
  }
};
