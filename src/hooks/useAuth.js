// Custom React Hook for Authentication

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deliveryAuthAPI, isAuthenticated, getUserRole, getAccountStatus, getKYCStatus } from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    if (isAuthenticated()) {
      setUser({
        role: getUserRole(),
        accountStatus: getAccountStatus(),
        kycStatus: getKYCStatus(),
      });
    }
  }, []);

  const register = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryAuthAPI.register(data);
      
      setUser({
        role: 'deliveryBoy',
        accountStatus: response.data.user.accountStatus,
        kycStatus: 'not_submitted',
      });

      return response;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryAuthAPI.login(email, password);
      
      setUser({
        role: 'deliveryBoy',
        accountStatus: response.data.user.accountStatus,
        kycStatus: response.data.kycStatus,
      });

      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryAuthAPI.verifyEmail(email, otp);
      return response;
    } catch (err) {
      setError(err.message || 'Email verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await deliveryAuthAPI.logout();
      setUser(null);
      router.push('/login');
    } catch (err) {
      setError(err.message || 'Logout failed');
      // Still redirect to login even if API call fails
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    register,
    login,
    verifyEmail,
    logout,
  };
}
