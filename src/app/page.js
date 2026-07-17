'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import DeliveryCyclistLoader from "@/components/common/DeliveryCyclistLoader";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (isAuthenticated()) {
      // Redirect to dashboard if logged in
      router.push('/dashboard');
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
  }, [router]);

  // Show loading while redirecting
  return <DeliveryCyclistLoader />;
}
