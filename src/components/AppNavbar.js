'use client';

import { useState, useEffect } from "react";
import { Bell, AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { useSocketContext } from "@/components/SocketProvider";
import { useProfile } from "@/hooks/useProfile";
import locationService from "@/services/locationService";
import { toast } from 'react-hot-toast';
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

    // Perfectly fetch API when status updates via socket
    const handleStatusUpdate = () => {
      loadStatus();
    };

    if (socketService) {
      socketService.on('online_status_updated', handleStatusUpdate);
    }

    return () => {
      if (socketService) {
        socketService.off('online_status_updated', handleStatusUpdate);
      }
    };
  }, [getStatus, socketService]);

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
        toast.success('You are now online and available for orders!');
      } else {
        // Going offline
        socketService.goOffline();
        locationService.stopTracking();
        toast.success('You are now offline');
      }
    } catch (err) {
      // Show detailed error message
      setErrorMessage(err.message || 'Failed to toggle status');
      setShowStatusModal(true);
    }
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between border-b border-border bg-card px-2 sm:px-4 sticky top-0 z-30 w-full">

        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sidebar Trigger (manual) */}
          <button className="text-foreground text-xl md:hidden p-1" onClick={toggleMenu}>
            ☰
          </button>

          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground">
              Delivery Panel
            </h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">

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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                status.isOnline
                  ? "bg-primary animate-pulse-dot"
                  : "bg-destructive"
              }`}
            />

            <span
              className={`text-xs font-medium hidden sm:block ${
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

      {/* Premium Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          {/* Glassmorphism Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowStatusModal(false);
              setErrorMessage('');
            }}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-background rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-muted/50 p-6 border-b border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Account Status Details
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Review your current account constraints
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-destructive leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Blocked Status */}
              {status.isBlocked && (
                <div className="relative overflow-hidden p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  <div className="relative z-10">
                    <p className="font-bold text-red-900 dark:text-red-400 mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Account Blocked
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300/80 leading-relaxed font-medium">
                      {status.blockReason || 'Your account has been blocked. Please contact support.'}
                    </p>
                  </div>
                </div>
              )}

              {/* KYC Status */}
              {status.kycStatus !== 'approved' && (
                <div className="relative overflow-hidden p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  <div className="relative z-10">
                    <p className="font-bold text-amber-900 dark:text-amber-500 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      KYC Verification Required
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-700/80 dark:text-amber-400/70">Current Status</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                          {status.kycStatus?.replace('_', ' ') || 'Not Submitted'}
                        </span>
                      </div>
                      <p className="text-sm text-amber-800/80 dark:text-amber-300/80 pt-1">
                        Please complete your KYC verification to start receiving orders.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Status */}
              {status.wallet && !status.wallet.isWithinLimit && (
                <div className="relative overflow-hidden p-5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  <div className="relative z-10">
                    <p className="font-bold text-orange-900 dark:text-orange-500 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      COD Limit Exceeded
                    </p>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                        <span className="text-orange-800/80 dark:text-orange-400/80">Pending Balance</span>
                        <span className="font-bold text-orange-900 dark:text-orange-400">₹{Math.abs(status.wallet.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                        <span className="text-orange-800/80 dark:text-orange-400/80">Allowed Limit</span>
                        <span className="font-bold text-orange-900 dark:text-orange-400">₹{(status.wallet.codLimit || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-300/80 mt-3 font-medium">
                      Please settle your pending dues to go online.
                    </p>
                  </div>
                </div>
              )}

              {/* Active Order */}
              {status.activeOrder && (
                <div className="relative overflow-hidden p-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  <div className="relative z-10">
                    <p className="font-bold text-blue-900 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Active Order Ongoing
                    </p>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700/80 dark:text-blue-300/70">Order ID</span>
                        <span className="font-bold text-blue-900 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                          {status.activeOrder.orderNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-blue-700/80 dark:text-blue-300/70">Status</span>
                        <span className="font-bold text-blue-800 dark:text-blue-400 text-xs uppercase tracking-wider bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                          {status.activeOrder.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 bg-background px-4 py-2.5 rounded-xl border border-border shadow-sm w-full sm:w-auto justify-center">
                <span className="text-sm font-medium text-muted-foreground">Ready to go online?</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold shadow-sm ${
                  status.canGoOnline 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                  {status.canGoOnline ? 'YES' : 'NO'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setErrorMessage('');
                }}
                className="w-full sm:w-auto px-8 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
