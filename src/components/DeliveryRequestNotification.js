'use client';

import { useState } from 'react';
import { X, MapPin, Package, Clock, DollarSign, Check } from 'lucide-react';
import { useSocketContext } from './SocketProvider';
import { useOrders } from '@/hooks/useOrders';

export default function DeliveryRequestNotification() {
  const { deliveryRequests, setDeliveryRequests } = useSocketContext();
  const { acceptOrder, rejectOrder, isLoading } = useOrders();
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (request) => {
    setProcessingId(request.orderId);
    try {
      await acceptOrder(request.orderId);
      // Remove from list
      setDeliveryRequests(prev => prev.filter(req => req.orderId !== request.orderId));
      alert('Order accepted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    const reason = prompt('Reason for rejection (optional):');
    setProcessingId(request.orderId);
    try {
      await rejectOrder(request.orderId, reason || '');
      // Remove from list
      setDeliveryRequests(prev => prev.filter(req => req.orderId !== request.orderId));
    } catch (err) {
      alert(err.message || 'Failed to reject order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = (orderId) => {
    setDeliveryRequests(prev => prev.filter(req => req.orderId !== orderId));
  };

  if (deliveryRequests.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
      {deliveryRequests.map((request) => (
        <div
          key={request.orderId}
          className="bg-white border-2 border-primary rounded-xl shadow-lg p-4 animate-slide-in-right"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                New Delivery Request
              </h3>
              <p className="text-sm text-muted-foreground">
                {request.orderNumber}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(request.orderId)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">
                {request.distance ? `${request.distance.toFixed(1)} km away` : 'Distance N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                ₹{request.amount?.toFixed(2)}
              </span>
              {request.estimatedEarnings && (
                <span className="text-xs text-muted-foreground">
                  (Earn: ₹{request.estimatedEarnings})
                </span>
              )}
            </div>

            {request.pickupLocation && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Pickup:</p>
                <p>{request.pickupLocation.address}</p>
              </div>
            )}

            {request.deliveryLocation && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Delivery:</p>
                <p>{request.deliveryLocation.address}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(request)}
              disabled={isLoading || processingId === request.orderId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => handleReject(request)}
              disabled={isLoading || processingId === request.orderId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>

          {/* Timer */}
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Respond quickly to get more orders</span>
          </div>
        </div>
      ))}
    </div>
  );
}
