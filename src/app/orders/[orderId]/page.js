'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Package, 
  User, 
  Phone, 
  MapPin, 
  Store, 
  Clock,
  CheckCircle,
  Loader2,
  Key
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useSocketContext } from "@/components/SocketProvider";

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickupOTP, setPickupOTP] = useState('');
  const [deliveryOTP, setDeliveryOTP] = useState('');
  const [showPickupOTP, setShowPickupOTP] = useState(false);
  const [showDeliveryOTP, setShowDeliveryOTP] = useState(false);

  const {
    getOrderDetails,
    markPickedUp,
    startDelivery,
    completeDelivery,
    generatePickupOTP,
    generateDeliveryOTP,
    isLoading,
    error
  } = useOrders();

  const { socketService } = useSocketContext();

  useEffect(() => {
    loadOrderDetails();

    // Join order room for real-time updates
    if (orderId) {
      socketService.joinOrder(orderId);
    }

    // Listen for order status updates
    const handleStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        console.log('Order status updated:', data);
        loadOrderDetails(); // Reload order details
      }
    };

    const handleOrderCancelled = (data) => {
      if (data.orderId === orderId) {
        alert('This order has been cancelled');
        router.push('/orders-summary');
      }
    };

    const handleOrderReady = (data) => {
      if (data.orderId === orderId) {
        loadOrderDetails(); // Reload to show updated status
      }
    };

    socketService.on('status_updated', handleStatusUpdate);
    socketService.on('order_cancelled', handleOrderCancelled);
    socketService.on('order_ready_for_pickup', handleOrderReady);

    // Cleanup
    return () => {
      socketService.off('status_updated', handleStatusUpdate);
      socketService.off('order_cancelled', handleOrderCancelled);
      socketService.off('order_ready_for_pickup', handleOrderReady);
      
      // Leave order room
      if (orderId) {
        socketService.leaveOrder(orderId);
      }
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await getOrderDetails(orderId);
      setOrder(response.data.order);
      setItems(response.data.items || []);
    } catch (err) {
      console.error('Failed to load order details:', err);
      alert('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPickedUp = async () => {
    if (!pickupOTP || pickupOTP.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await markPickedUp(orderId, pickupOTP);
      alert('Order marked as picked up!');
      loadOrderDetails();
      setPickupOTP('');
    } catch (err) {
      alert(err.message || 'Failed to mark as picked up');
    }
  };

  const handleStartDelivery = async () => {
    try {
      await startDelivery(orderId);
      alert('Delivery started!');
      loadOrderDetails();
    } catch (err) {
      alert(err.message || 'Failed to start delivery');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!deliveryOTP || deliveryOTP.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await completeDelivery(orderId, deliveryOTP);
      alert('Delivery completed successfully!');
      router.push('/orders-summary');
    } catch (err) {
      alert(err.message || 'Failed to complete delivery');
    }
  };

  const handleGeneratePickupOTP = async () => {
    try {
      const response = await generatePickupOTP(orderId);
      setShowPickupOTP(true);
      alert(`Pickup OTP: ${response.data.otp}`);
    } catch (err) {
      alert(err.message || 'Failed to generate OTP');
    }
  };

  const handleGenerateDeliveryOTP = async () => {
    try {
      const response = await generateDeliveryOTP(orderId);
      setShowDeliveryOTP(true);
      alert(`Delivery OTP: ${response.data.otp}`);
    } catch (err) {
      alert(err.message || 'Failed to generate OTP');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-700',
      ready_for_pickup: 'bg-yellow-100 text-yellow-700',
      picked_up: 'bg-purple-100 text-purple-700',
      out_for_delivery: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status) => {
    return status?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <span className={`inline-block text-xs px-2 py-1 rounded-md mt-1 ${getStatusColor(order.orderStatus)}`}>
              {formatStatus(order.orderStatus)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              ₹{order.totalAmount?.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.paymentMethod}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Customer Info */}
        <div className="border border-border/50 rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Details
          </h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Name:</span>{' '}
              <span className="font-medium">{order.customerId?.fullname}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{order.customerId?.phone}</span>
            </p>
            {order.customerId?.email && (
              <p className="text-sm">
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-medium">{order.customerId.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Shop Info */}
        {order.shopId && (
          <div className="border border-border/50 rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Shop Details
            </h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{order.shopId.fullname}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{order.shopId.phone}</span>
              </p>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order.deliveryAddressId && (
          <div className="border border-border/50 rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h2>
            <p className="text-sm text-foreground">
              {order.deliveryAddressId.addressLine1}
              {order.deliveryAddressId.addressLine2 && `, ${order.deliveryAddressId.addressLine2}`}
              {order.deliveryAddressId.city && `, ${order.deliveryAddressId.city}`}
              {order.deliveryAddressId.pincode && ` - ${order.deliveryAddressId.pincode}`}
            </p>
          </div>
        )}

        {/* Order Items */}
        {items.length > 0 && (
          <div className="border border-border/50 rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.unitPrice}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    ₹{item.totalPrice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions based on status */}
        {order.orderStatus === 'ready_for_pickup' && (
          <div className="border border-border/50 rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3">Mark as Picked Up</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Enter Pickup OTP from Shopkeeper
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pickupOTP}
                  onChange={(e) => setPickupOTP(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 border border-border rounded-lg text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkPickedUp}
                  disabled={isLoading || pickupOTP.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Picked Up
                </button>
                <button
                  onClick={handleGeneratePickupOTP}
                  disabled={isLoading}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {order.orderStatus === 'picked_up' && (
          <div className="border border-border/50 rounded-xl p-4">
            <button
              onClick={handleStartDelivery}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Clock className="w-5 h-5" />
              Start Delivery
            </button>
          </div>
        )}

        {order.orderStatus === 'out_for_delivery' && (
          <div className="border border-border/50 rounded-xl p-4">
            <h2 className="font-semibold text-foreground mb-3">Complete Delivery</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Enter Delivery OTP from Customer
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={deliveryOTP}
                  onChange={(e) => setDeliveryOTP(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 border border-border rounded-lg text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCompleteDelivery}
                  disabled={isLoading || deliveryOTP.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Delivery
                </button>
                <button
                  onClick={handleGenerateDeliveryOTP}
                  disabled={isLoading}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
