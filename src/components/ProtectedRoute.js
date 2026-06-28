'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAccountStatus } from '@/lib/api';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Redirects to login if not authenticated
 * Shows loading state during check
 */
export default function ProtectedRoute({ children, requireActive = false }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Check if account must be active
      if (requireActive) {
        const status = getAccountStatus();
        if (status === 'blocked') {
          router.push('/login?error=blocked');
          return;
        }
        if (status === 'pending') {
          router.push('/dashboard?warning=pending');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router, requireActive]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
