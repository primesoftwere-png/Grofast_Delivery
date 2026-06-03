'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Package, Clock, DollarSign, Check, Bike, Store } from 'lucide-react';
import { useSocketContext } from './SocketProvider';
import { deliveryOrderAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

const ACCEPT_TIMEOUT_SECONDS = 60; // 60 seconds to accept before auto-dismiss

export default function DeliveryRequestNotification() {
  const { deliveryRequests, setDeliveryRequests, setNotifications } = useSocketContext();
  const [processingId, setProcessingId] = useState(null);
  const [timers, setTimers] = useState({}); // { orderId: secondsLeft }
  const [rejectModal, setRejectModal] = useState(null); // { orderId, orderNumber }
  const [rejectReason, setRejectReason] = useState('');
  const router = useRouter();

  // Countdown timer for each request
  useEffect(() => {
    if (deliveryRequests.length === 0) return;

    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let hasExpired = false;

        deliveryRequests.forEach(req => {
          const orderId = req.orderId?.toString();
          const elapsed = Math.floor((Date.now() - (req.receivedAt || Date.now())) / 1000);
          const remaining = Math.max(0, ACCEPT_TIMEOUT_SECONDS - elapsed);
          updated[orderId] = remaining;
          if (remaining === 0) hasExpired = true;
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deliveryRequests]);

  // Auto-dismiss expired requests
  useEffect(() => {
    const expired = deliveryRequests.filter(req => {
      const remaining = timers[req.orderId?.toString()];
      return remaining !== undefined && remaining <= 0;
    });

    if (expired.length > 0) {
      setDeliveryRequests(prev =>
        prev.filter(req => !expired.some(e => e.orderId === req.orderId))
      );
    }
  }, [timers, deliveryRequests, setDeliveryRequests]);

  const handleAccept = useCallback(async (request) => {
    const orderId = request.orderId?.toString();
    if (processingId) return;
    setProcessingId(orderId);

    try {
      const response = await deliveryOrderAPI.acceptOrder(orderId);
      
      // Remove from list
      setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId));
      
      // Add success notification
      setNotifications(prev => [...prev, {
        type: 'success',
        title: 'Order Accepted! 🎉',
        message: `Order ${request.orderNumber || ''} accepted. Head to the shop now.`,
        timestamp: new Date()
      }]);

      // Navigate to order details
      const responseOrderId = response?.data?.orderId || orderId;
      router.push(`/orders/${responseOrderId}`);

    } catch (err) {
      setNotifications(prev => [...prev, {
        type: 'error',
        title: 'Failed to Accept',
        message: err.message || 'Could not accept order. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setProcessingId(null);
    }
  }, [processingId, setDeliveryRequests, setNotifications, router]);

  const openRejectModal = (request) => {
    setRejectModal({ orderId: request.orderId?.toString(), orderNumber: request.orderNumber });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const { orderId, orderNumber } = rejectModal;
    setProcessingId(orderId);

    try {
      await deliveryOrderAPI.rejectOrder(orderId, rejectReason || 'Not available');
      
      // Remove from list
      setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      // Even if API fails, remove from UI (delivery boy can't accept it anyway)
      setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId));
      setRejectModal(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = (orderId) => {
    setDeliveryRequests(prev => prev.filter(req => req.orderId?.toString() !== orderId?.toString()));
  };

  if (deliveryRequests.length === 0 && !rejectModal) return null;

  return (
    <>
      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-2">Reject Order</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Order {rejectModal.orderNumber} — Please provide a reason (optional)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Too far away, Already have an order..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-24 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!processingId}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
              >
                {processingId ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Request Cards */}
      <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {deliveryRequests.map((request) => {
          const orderId = request.orderId?.toString();
          const timeLeft = timers[orderId] ?? ACCEPT_TIMEOUT_SECONDS;
          const timerPercent = (timeLeft / ACCEPT_TIMEOUT_SECONDS) * 100;
          const isProcessing = processingId === orderId;

          return (
            <div
              key={orderId}
              className="bg-white dark:bg-card border-2 border-primary/60 rounded-2xl shadow-2xl overflow-hidden animate-slide-in-right pointer-events-auto"
            >
              {/* Timer bar */}
              <div className="h-1.5 bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${timerPercent}%`, backgroundColor: timeLeft <= 10 ? '#ef4444' : undefined }}
                />
              </div>

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">New Order! 🛵</p>
                      <p className="text-xs text-muted-foreground">{request.orderNumber || orderId?.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                      <Clock className="w-3 h-3" />
                      {timeLeft}s
                    </div>
                    <button
                      onClick={() => handleDismiss(orderId)}
                      className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  {/* Earnings */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Order Value</span>
                    </div>
                    <span className="font-bold text-foreground">
                      ₹{(request.totalAmount || request.amount || 0).toFixed ? 
                        (request.totalAmount || request.amount || 0).toFixed(0) : 
                        (request.totalAmount || request.amount || 0)}
                    </span>
                  </div>

                  {/* Estimated Earnings */}
                  {request.estimatedEarnings && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Bike className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Your Earnings</span>
                      </div>
                      <span className="font-semibold text-primary">₹{request.estimatedEarnings}</span>
                    </div>
                  )}

                  {/* Distance */}
                  {request.distance && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="text-muted-foreground">Distance</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{request.distance}</span>
                    </div>
                  )}

                  {/* Shop Name */}
                  {request.pickupLocation?.shopName && (
                    <div className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-2">
                      <Store className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-foreground font-medium text-xs">{request.pickupLocation.shopName}</p>
                        {request.pickupLocation.address && (
                          <p className="text-muted-foreground text-xs">{request.pickupLocation.address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery location */}
                  {request.deliveryLocation?.address && (
                    <div className="flex items-start gap-2 text-sm bg-muted/50 rounded-lg p-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deliver to</p>
                        <p className="text-foreground text-xs">{request.deliveryLocation.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request)}
                    disabled={isProcessing || !!processingId}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all text-sm font-bold shadow-sm hover:shadow-md active:scale-95"
                  >
                    {isProcessing ? (
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isProcessing ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => openRejectModal(request)}
                    disabled={isProcessing || !!processingId}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 transition-all text-sm font-medium active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
