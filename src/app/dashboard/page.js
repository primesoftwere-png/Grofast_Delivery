'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, Clock, TrendingUp, MapPin, Check, X, Loader2, RefreshCw, Wifi, WifiOff, Bell } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import DeliveryCyclistLoader from "@/components/common/DeliveryCyclistLoader";
import { useSocketContext } from "@/components/SocketProvider";
import { toast } from 'react-hot-toast';

// Status badge color mapping (uppercase backend statuses)
function getStatusBadge(status) {
  const map = {
    'PENDING': { bg: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    'CONFIRMED': { bg: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
    'ASSIGNED_TO_DELIVERY': { bg: 'bg-purple-100 text-purple-700', label: 'Assigned to You' },
    'READY_FOR_PICKUP': { bg: 'bg-orange-100 text-orange-700', label: 'Ready for Pickup' },
    'OUT_FOR_DELIVERY': { bg: 'bg-orange-500 text-white', label: 'Out for Delivery' },
    'DELIVERED': { bg: 'bg-green-100 text-green-700', label: 'Delivered' },
    'CANCELLED': { bg: 'bg-red-100 text-red-700', label: 'Cancelled' },
    // Legacy lowercase statuses
    'confirmed': { bg: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
    'ready_for_pickup': { bg: 'bg-orange-100 text-orange-700', label: 'Ready for Pickup' },
    'out_for_delivery': { bg: 'bg-orange-500 text-white', label: 'Out for Delivery' },
    'delivered': { bg: 'bg-green-100 text-green-700', label: 'Delivered' },
    'picked_up': { bg: 'bg-purple-100 text-purple-700', label: 'Picked Up' },
  };
  return map[status] || { bg: 'bg-gray-100 text-gray-700', label: status || 'Unknown' };
}

function isActiveOrder(status) {
  const activeStatuses = [
    'OUT_FOR_DELIVERY', 'ASSIGNED_TO_DELIVERY', 'READY_FOR_PICKUP',
    'out_for_delivery', 'ready_for_pickup', 'picked_up'
  ];
  return activeStatuses.includes(status);
}

export default function Dashboard() {
  const router = useRouter();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // orderId being processed
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayEarnings: 0,
    avgDelivery: 0,
    rating: 4.8
  });

  const {
    getAvailableOrders,
    getAssignedOrders,
    acceptOrder,
    rejectOrder,
    isLoading,
    error
  } = useOrders();

  const { socketService, notifications, deliveryRequests, isConnected, setDeliveryRequests } = useSocketContext();

  const showToast = useCallback((type, message) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message);
  }, []);

  const loadDashboardData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Try to load available orders (requires online + available status)
      try {
        const availableResponse = await getAvailableOrders();
        setAvailableOrders(availableResponse.data?.orders || []);
      } catch (availErr) {
        // Delivery boy might be offline/unavailable - that's ok
        if (!availErr.message?.includes('online') && !availErr.message?.includes('unavailable')) {
          console.warn('Available orders fetch error:', availErr.message);
        }
        setAvailableOrders([]);
      }

      // Load assigned orders
      const assignedResponse = await getAssignedOrders();
      const assigned = assignedResponse.data?.orders || [];
      setAssignedOrders(assigned);

      // Find active order
      const active = assigned.find(order => isActiveOrder(order.orderStatus));
      setActiveOrder(active || null);

      // Stats
      const delivered = assigned.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'delivered');
      setStats({
        todayOrders: assigned.length,
        todayEarnings: delivered.reduce((sum, o) => sum + (o.deliveryCharge || o.deliveryEarnings || 50), 0),
        avgDelivery: 18,
        rating: 4.8
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [getAvailableOrders, getAssignedOrders]);

  // Initial load
  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Real-time socket listeners
  useEffect(() => {
    // When a new order becomes available via socket, add to list
    const handleOrderAvailable = (data) => {
      // Data is already handled by SocketProvider and added to deliveryRequests
      // We just reload from server in the background for consistency
      loadDashboardData(false);
    };

    // When order is taken by another delivery boy
    const handleOrderTaken = (data) => {
      setActionLoading(null);
      showToast('info', 'Order taken by another delivery boy');
      loadDashboardData(false);
    };

    // When delivery boy accepts an order → reload dashboard
    const handleOrderAssigned = (data) => {
      const orderId = data?.orderId || data?._id;
      if (orderId) {
        setAvailableOrders(prev => prev.filter(o => o._id?.toString() !== orderId?.toString()));
        if (setDeliveryRequests) {
          setDeliveryRequests(prev => prev.filter(req => (req.orderId?.toString() || req._id?.toString()) !== orderId?.toString()));
        }
      }
      showToast('success', '✅ Order accepted! Head to the shop for pickup.');
      setActionLoading(null);
      loadDashboardData(false);
      
      if (orderId) {
        setTimeout(() => router.push(`/orders/${orderId}`), 1000);
      }
    };

    // When order status changes
    const handleStatusUpdate = () => {
      loadDashboardData(false);
    };

    socketService.on('order_available', handleOrderAvailable);
    socketService.on('delivery_request', handleOrderAvailable);
    socketService.on('order_taken', handleOrderTaken);
    socketService.on('order_assigned', handleOrderAssigned);
    socketService.on('status_updated', handleStatusUpdate);
    socketService.on('order_ready_for_pickup', handleStatusUpdate);
    socketService.on('order_cancelled', handleStatusUpdate);

    return () => {
      socketService.off('order_available', handleOrderAvailable);
      socketService.off('delivery_request', handleOrderAvailable);
      socketService.off('order_taken', handleOrderTaken);
      socketService.off('order_assigned', handleOrderAssigned);
      socketService.off('status_updated', handleStatusUpdate);
      socketService.off('order_ready_for_pickup', handleStatusUpdate);
      socketService.off('order_cancelled', handleStatusUpdate);
    };
  }, [socketService, loadDashboardData]);

  const handleAcceptOrder = async (orderId) => {
    setActionLoading(orderId);
    
    // First try to assign via Socket.io as it's real-time (requested feature)
    const socketSuccess = socketService.acceptOrder(orderId);
    
    if (!socketSuccess) {
      // Fallback to API if socket is unavailable
      try {
        const response = await acceptOrder(orderId);
        setAvailableOrders(prev => prev.filter(o => o._id?.toString() !== orderId?.toString()));
        if (setDeliveryRequests) {
          setDeliveryRequests(prev => prev.filter(req => (req.orderId?.toString() || req._id?.toString()) !== orderId?.toString()));
        }
        showToast('success', '✅ Order accepted! Head to the shop for pickup.');
        loadDashboardData(false);
        // Navigate to order details
        const responseOrderId = response?.data?.orderId || orderId;
        setTimeout(() => router.push(`/orders/${responseOrderId}`), 1000);
      } catch (err) {
        showToast('error', err.message || 'Failed to accept order');
        setActionLoading(null);
      }
    } else {
      // Socket emitted successfully. We rely on handleOrderAssigned listener to handle success
      // Add a fallback timeout in case socket event is lost
      setTimeout(() => {
        setActionLoading(prev => prev === orderId ? null : prev);
      }, 8000);
    }
  };

  const handleRejectOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      await rejectOrder(orderId, 'Not available');
      setAvailableOrders(prev => prev.filter(o => o._id?.toString() !== orderId?.toString()));
      if (setDeliveryRequests) {
        setDeliveryRequests(prev => prev.filter(req => (req.orderId?.toString() || req._id?.toString()) !== orderId?.toString()));
      }
      showToast('info', 'Order rejected');
    } catch (err) {
      // Remove from UI anyway
      setAvailableOrders(prev => prev.filter(o => o._id?.toString() !== orderId?.toString()));
      if (setDeliveryRequests) {
        setDeliveryRequests(prev => prev.filter(req => (req.orderId?.toString() || req._id?.toString()) !== orderId?.toString()));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewOrder = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  const statsData = [
    { label: "Today's Orders", value: stats.todayOrders.toString(), icon: Package, color: "text-primary" },
    { label: "Earnings Today", value: `₹${stats.todayEarnings}`, icon: DollarSign, color: "text-green-500" },
    { label: "Avg. Delivery", value: `${stats.avgDelivery} min`, icon: Clock, color: "text-blue-500" },
    { label: "Rating", value: stats.rating.toFixed(1), icon: TrendingUp, color: "text-yellow-500" },
  ];

  // Merge API available orders with real-time socket requests for instant UI update
  const displayOrders = [...availableOrders];
  deliveryRequests.forEach(req => {
    const reqId = req.orderId?.toString() || req._id?.toString();
    if (!displayOrders.some(o => (o._id?.toString() || o.orderId?.toString()) === reqId)) {
      displayOrders.unshift({
        ...req,
        _id: reqId,
      });
    }
  });

  if (loading) {
    return <DeliveryCyclistLoader />;
  }

  return (
    <div className="p-4">

      <div className="space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-1.5 mt-1">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-500">Offline</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell for pending delivery requests */}
            {deliveryRequests.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-primary animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {deliveryRequests.length}
                </span>
              </div>
            )}
            <button
              onClick={() => loadDashboardData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsData.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="border border-border/50 rounded-xl bg-card hover:shadow-sm transition-shadow">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Order Card */}
        {activeOrder && (
          <div className="border-2 border-primary/30 bg-primary/5 rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-base font-bold text-foreground">🚀 Active Delivery</p>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(activeOrder.orderStatus).bg}`}>
                {getStatusBadge(activeOrder.orderStatus).label}
              </span>
            </div>

            <div className="p-4 pt-2 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-foreground">{activeOrder.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeOrder.shopId?.fullname || activeOrder.shopId?.shopName} → {activeOrder.customerId?.fullname}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">₹{activeOrder.totalAmount?.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{activeOrder.paymentMethod}</p>
                </div>
              </div>

              {activeOrder.deliveryAddressId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{activeOrder.deliveryAddressId.addressLine1}</span>
                </div>
              )}

              <button
                onClick={() => handleViewOrder(activeOrder._id)}
                className="w-full text-sm px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                View Order & Take Action →
              </button>
            </div>
          </div>
        )}

        {/* Available Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Available Orders</h2>
              {displayOrders.length > 0 && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                  {displayOrders.length}
                </span>
              )}
            </div>
            <button
              onClick={() => router.push('/orders-summary')}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>

          {displayOrders.length === 0 ? (
            <div className="border border-border/50 rounded-xl p-10 text-center bg-card">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground font-medium">No available orders</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected ? 'New orders will appear here automatically' : 'Connect to receive new orders'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayOrders.slice(0, 5).map((order) => {
                const orderId = order._id?.toString() || order.orderId?.toString();
                const isProcessing = actionLoading === orderId;
                return (
                  <div
                    key={orderId}
                    className="border border-border/50 rounded-xl bg-card animate-slide-in-right hover:shadow-sm transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.shopId?.fullname || order.shopId?.shopName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">₹{order.totalAmount?.toFixed ? order.totalAmount.toFixed(0) : order.totalAmount}</p>
                          {order.distance && (
                            <p className="text-xs text-muted-foreground">{order.distance}</p>
                          )}
                        </div>
                      </div>

                      {order.customerId?.fullname && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Customer: {order.customerId.fullname} • {order.paymentMethod}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptOrder(orderId)}
                          disabled={isProcessing || !!actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 text-sm px-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all font-semibold active:scale-95"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          {isProcessing ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRejectOrder(orderId)}
                          disabled={isProcessing || !!actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 text-sm px-3 py-2.5 rounded-xl border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 transition-all active:scale-95"
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
          )}
        </div>

        {/* My Orders Summary */}
        {assignedOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">My Orders</h2>
              <button
                onClick={() => router.push('/orders-summary')}
                className="text-sm text-primary hover:underline"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedOrders.slice(0, 4).map((order) => {
                const badge = getStatusBadge(order.orderStatus);
                return (
                  <div
                    key={order._id}
                    className="border border-border/50 rounded-xl p-4 bg-card hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                    onClick={() => handleViewOrder(order._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.customerId?.fullname}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-base font-bold text-foreground">₹{order.totalAmount?.toFixed ? order.totalAmount.toFixed(0) : order.totalAmount}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
