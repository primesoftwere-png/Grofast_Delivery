'use client';

import { useState, useEffect } from "react";
import { Bell, AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { useSocketContext } from "@/components/SocketProvider";
import { useProfile } from "@/hooks/useProfile";
import locationService from "@/services/locationService";
import { useRouter } from "next/navigation";

export function AppNavbar({ toggleMenu }) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  
  const {
    status,
    isLoading,
    error,
    getStatus,
    toggleStatus,
  } = useAvailability();

  const { isConnected, socketService } = useSocketContext();
  const { profile } = useProfile();

  const getInitials = (name) => {
    if (!name) return 'RK';
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };
  
  const displayName = profile?.user?.fullname || (profile?.deliveryBoy?.firstName ? `${profile?.deliveryBoy?.firstName || ''} ${profile?.deliveryBoy?.lastName || ''}`.trim() : 'Delivery Boy');
  const displayInitials = getInitials(displayName);

  useEffect(() => {
    // Load status on mount
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      await getStatus();
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  };

  const handleToggle = async () => {
    setErrorMessage('');
    
    try {
      const newStatus = !status.isOnline;
      await toggleStatus(newStatus);
      
      // Handle Socket.IO and location tracking
      if (newStatus) {
        // Going online
        socketService.goOnline();
        locationService.startTracking(5000); // Update every 5 seconds
        alert('You are now online and available for orders!');
      } else {
        // Going offline
        socketService.goOffline();
        locationService.stopTracking();
        alert('You are now offline');
      }
    } catch (err) {
      // Show detailed error message
      setErrorMessage(err.message || 'Failed to toggle status');
      setShowStatusModal(true);
    }
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-30">

        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Sidebar Trigger (manual) */}
          <button className="text-foreground text-lg md:hidden" onClick={toggleMenu}>
            ☰
          </button>

          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground">
              Delivery Panel
            </h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Socket Connection Status */}
          <div className="hidden sm:flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600">Disconnected</span>
              </>
            )}
          </div>

          {/* Online / Offline Toggle */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                status.isOnline
                  ? "bg-primary animate-pulse-dot"
                  : "bg-destructive"
              }`}
            />

            <span
              className={`text-xs font-medium ${
                status.isOnline ? "text-primary" : "text-destructive"
              }`}
            >
              {status.isOnline ? "Online" : "Offline"}
            </span>

            {/* Switch */}
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition disabled:opacity-50 ${
                status.isOnline ? "bg-primary" : "bg-muted"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-white mx-auto" />
              ) : (
                <div
                  className={`w-4 h-4 bg-white rounded-full transition ${
                    status.isOnline ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              )}
            </button>
          </div>

          {/* Blocked/KYC Warning */}
          {(status.isBlocked || status.kycStatus !== 'approved') && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />

            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/profile')}
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground overflow-hidden">
              {profile?.deliveryBoy?.profileImage ? (
                <img src={profile.deliveryBoy.profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayInitials
              )}
            </div>

            <span className="text-sm font-medium text-foreground hidden sm:block">
              {displayName}
            </span>
          </div>

        </div>
      </header>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-semibold text-foreground">
                Account Status
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Blocked Status */}
              {status.isBlocked && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-1">Account Blocked</p>
                  <p className="text-sm text-red-700">
                    {status.blockReason || 'Your account has been blocked. Please contact support.'}
                  </p>
                </div>
              )}

              {/* KYC Status */}
              {status.kycStatus !== 'approved' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-semibold text-yellow-900 mb-1">KYC Verification Required</p>
                  <p className="text-sm text-yellow-700">
                    Status: <span className="font-medium">{status.kycStatus || 'Not Submitted'}</span>
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete KYC verification to go online.
                  </p>
                </div>
              )}

              {/* Wallet Status */}
              {status.wallet && !status.wallet.isWithinLimit && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-semibold text-orange-900 mb-1">COD Limit Exceeded</p>
                  <p className="text-sm text-orange-700">
                    Balance: <span className="font-medium">₹{status.wallet.balance}</span>
                  </p>
                  <p className="text-sm text-orange-700">
                    Limit: <span className="font-medium">₹{status.wallet.codLimit}</span>
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Please settle your dues to go online.
                  </p>
                </div>
              )}

              {/* Active Order */}
              {status.activeOrder && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-1">Active Order</p>
                  <p className="text-sm text-blue-700">
                    Order: <span className="font-medium">{status.activeOrder.orderNumber}</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Status: <span className="font-medium">{status.activeOrder.orderStatus}</span>
                  </p>
                </div>
              )}

              {/* Can Go Online Status */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Can Go Online: <span className={`font-medium ${status.canGoOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {status.canGoOnline ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowStatusModal(false);
                setErrorMessage('');
              }}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
