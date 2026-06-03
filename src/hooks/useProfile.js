import { useState, useEffect } from 'react';
import { deliveryProfileAPI } from '@/lib/api';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deliveryProfileAPI.getProfile();
      // Adjust according to the API response structure if needed
      setProfile(response.data || response); 
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deliveryProfileAPI.updateProfile(data);
      // Update profile with the new data from response
      setProfile(prev => ({ ...prev, ...(response.data || response) })); 
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}
