'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
  Key,
  AlertCircle
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import DeliveryCyclistLoader from "@/components/common/DeliveryCyclistLoader";
import { useSocketContext } from "@/components/SocketProvider";
import { toast } from 'react-hot-toast';
import locationService from '@/services/locationService';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-muted rounded-xl animate-pulse flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
});

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickupOTP, setPickupOTP] = useState('');
  const [deliveryOTP, setDeliveryOTP] = useState('');
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);

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

  const showMessage = (type, text) => {
    if (type === 'success') toast.success(text);
    else if (type === 'error') toast.error(text);
    else toast(text);
  };

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await getOrderDetails(orderId);
      setOrder(response.data.order);
      setItems(response.data.items || []);
    } catch (err) {
      console.error('Failed to load order details:', err);
      showMessage('error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order) {
      if (order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'out_for_delivery') {
        locationService.setActiveOrderId(order._id || orderId);
        locationService.startTracking(5000); // 5 seconds interval
      } else if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'delivered' || order.orderStatus === 'CANCELLED' || order.orderStatus === 'cancelled') {
        locationService.setActiveOrderId(null);
      }
    }
  }, [order, orderId]);

  const handleMarkPickedUp = async () => {
    if (!pickupOTP || pickupOTP.length !== 6) {
      showMessage('error', 'Please enter a valid 6-digit OTP from the shopkeeper');
      return;
    }

    try {
      await markPickedUp(orderId, pickupOTP);
      showMessage('success', '✅ Order picked up! Head to customer address.');
      loadOrderDetails();
      setPickupOTP('');
    } catch (err) {
      showMessage('error', err.message || 'Failed to mark as picked up');
    }
  };

  const handleStartDelivery = async () => {
    try {
      await startDelivery(orderId);
      showMessage('success', '🚀 Delivery started!');
      loadOrderDetails();
    } catch (err) {
      showMessage('error', err.message || 'Failed to start delivery');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!deliveryOTP || deliveryOTP.length !== 6) {
      showMessage('error', 'Please enter a valid 6-digit OTP from the customer');
      return;
    }

    try {
      await completeDelivery(orderId, deliveryOTP);
      locationService.setActiveOrderId(null);
      showMessage('success', '🎉 Delivery completed! Earnings added to wallet.');
      setTimeout(() => router.push('/orders-summary'), 2000);
    } catch (err) {
      showMessage('error', err.message || 'Failed to complete delivery');
    }
  };

  const handleGeneratePickupOTP = async () => {
    try {
      const response = await generatePickupOTP(orderId);
      showMessage('info', `Pickup OTP generated. Show to shopkeeper.`);
    } catch (err) {
      showMessage('error', err.message || 'Failed to generate OTP');
    }
  };

  const handleGenerateDeliveryOTP = async () => {
    try {
      const response = await generateDeliveryOTP(orderId);
      showMessage('info', `Delivery OTP generated.`);
    } catch (err) {
      showMessage('error', err.message || 'Failed to generate OTP');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      // Uppercase (backend)
      'CONFIRMED': 'bg-blue-100 text-blue-700',
      'ASSIGNED_TO_DELIVERY': 'bg-purple-100 text-purple-700',
      'READY_FOR_PICKUP': 'bg-yellow-100 text-yellow-700',
      'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-700',
      'DELIVERED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      // Lowercase (legacy)
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
    return <DeliveryCyclistLoader />;
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Map Section */}
        <div className="border border-border/50 rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h2>
          <MapComponent 
            shopLocation={order?.shopDetails} 
            customerLocation={order?.deliveryAddressId} 
            orderStatus={order?.orderStatus} 
            onLocationUpdate={(loc, details = {}) => {
              setDeliveryBoyLocation(loc);
              if (socketService.isSocketConnected()) {
                const locationData = {
                  orderId: order?._id || orderId,
                  lat: loc[0],
                  lng: loc[1],
                  speed: details.speed || 0,
                  heading: details.heading || 0,
                  accuracy: details.accuracy || 0
                };
                // Use the standard updateLocation method
                socketService.updateLocation(locationData);
                
                // Also emit directly to catch common backend event names just in case
                const socket = socketService.getSocket();
                if (socket) {
                  socket.emit('update-location', locationData);
                  socket.emit('updateLocation', locationData);
                  socket.emit('update_location', locationData);
                }
              }
            }}
          />
          
          {deliveryBoyLocation && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Delivery Boy Live Location
              </span>
              <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded font-medium tracking-tight">
                {deliveryBoyLocation[0].toFixed(6)}, {deliveryBoyLocation[1].toFixed(6)}
              </span>
            </div>
          )}
        </div>


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
        {/* ASSIGNED_TO_DELIVERY: Delivery boy needs to go pick up order, enter OTP */}
        {(order.orderStatus === 'ASSIGNED_TO_DELIVERY' || order.orderStatus === 'READY_FOR_PICKUP' || order.orderStatus === 'ready_for_pickup') && (
          <div className="border border-border/50 rounded-xl p-4 bg-card">
            <h2 className="font-semibold text-foreground mb-1">Step 1: Pick Up Order</h2>
            <p className="text-sm text-muted-foreground mb-3">Get the 6-digit OTP from the shopkeeper and enter it below to confirm pickup.</p>
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

        {/* OUT_FOR_DELIVERY: Delivery boy has picked up, now delivers to customer */}
        {(order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'out_for_delivery') && (
          <div className="border border-border/50 rounded-xl p-4 bg-card">
            <h2 className="font-semibold text-foreground mb-1">Step 2: Complete Delivery</h2>
            <p className="text-sm text-muted-foreground mb-3">Get the 6-digit OTP from the customer to confirm delivery.</p>
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
