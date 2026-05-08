'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, Clock, TrendingUp, MapPin, Check, X, Loader2, RefreshCw } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useSocketContext } from "@/components/SocketProvider";

export default function Dashboard() {
  const router = useRouter();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const { socketService, notifications } = useSocketContext();

  useEffect(() => {
    loadDashboardData();

    // Listen for real-time updates
    const handleStatusUpdate = () => {
      loadDashboardData(); // Reload dashboard when status changes
    };

    const handleOrderReady = () => {
      loadDashboardData(); // Reload when order is ready
    };

    socketService.on('status_updated', handleStatusUpdate);
    socketService.on('order_ready_for_pickup', handleOrderReady);
    socketService.on('order_cancelled', handleStatusUpdate);

    // Cleanup
    return () => {
      socketService.off('status_updated', handleStatusUpdate);
      socketService.off('order_ready_for_pickup', handleOrderReady);
      socketService.off('order_cancelled', handleStatusUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load available orders
      const availableResponse = await getAvailableOrders();
      setAvailableOrders(availableResponse.data.orders || []);

      // Load assigned orders
      const assignedResponse = await getAssignedOrders();
      const assigned = assignedResponse.data.orders || [];
      setAssignedOrders(assigned);

      // Find active order (out_for_delivery or picked_up)
      const active = assigned.find(
        order => order.orderStatus === 'out_for_delivery' || order.orderStatus === 'picked_up'
      );
      setActiveOrder(active || null);

      // Calculate stats (you can enhance this based on your needs)
      setStats({
        todayOrders: assigned.length,
        todayEarnings: assigned.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        avgDelivery: 18, // This should come from backend
        rating: 4.8 // This should come from backend
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId);
      loadDashboardData(); // Reload data
      alert('Order accepted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await rejectOrder(orderId, reason || '');
      loadDashboardData(); // Reload data
      alert('Order rejected');
    } catch (err) {
      alert(err.message || 'Failed to reject order');
    }
  };

  const handleViewOrder = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  const statsData = [
    { label: "Today's Orders", value: stats.todayOrders.toString(), icon: Package, color: "text-primary" },
    { label: "Earnings Today", value: `₹${stats.todayEarnings.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
    { label: "Avg. Delivery", value: `${stats.avgDelivery} min`, icon: Clock, color: "text-info" },
    { label: "Rating", value: stats.rating.toString(), icon: TrendingUp, color: "text-warning" },
  ];

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="border border-border/50 rounded-xl">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Order */}
        {activeOrder && (
          <div className="border border-primary/30 bg-primary/5 rounded-xl">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold">Active Delivery</p>

                {/* Badge */}
                <span className="px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground">
                  {activeOrder.orderStatus === 'out_for_delivery' ? 'Out for Delivery' : 'Picked Up'}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">
                    {activeOrder.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeOrder.shopId?.fullname} → {activeOrder.customerId?.fullname}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-primary">
                    ₹{activeOrder.totalAmount?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeOrder.paymentMethod}
                  </p>
                </div>
              </div>

              {activeOrder.deliveryAddressId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{activeOrder.deliveryAddressId.addressLine1}</span>
                </div>
              )}

              {/* Button */}
              <button
                onClick={() => handleViewOrder(activeOrder._id)}
                className="w-full text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View Order Details
              </button>
            </div>
          </div>
        )}

        {/* Incoming Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Available Orders
            </h2>
            <button
              onClick={() => router.push('/orders-summary')}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>

          {availableOrders.length === 0 ? (
            <div className="border border-border/50 rounded-xl p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No available orders at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.slice(0, 3).map((order) => (
                <div
                  key={order._id}
                  className="border border-border/50 rounded-xl animate-slide-in-right"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.shopId?.fullname}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ₹{order.totalAmount?.toFixed(2)}
                        </p>
                        {order.distance && (
                          <p className="text-xs text-muted-foreground">
                            {order.distance.toFixed(1)} km
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-3 text-sm text-muted-foreground">
                      <p>Customer: {order.customerId?.fullname}</p>
                      <p>Payment: {order.paymentMethod}</p>
                    </div>

                    <div className="flex gap-2">
                      {/* Accept */}
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => handleRejectOrder(order._id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Orders Summary */}
        {assignedOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">
                My Orders
              </h2>
              <button
                onClick={() => router.push('/orders-summary?tab=assigned')}
                className="text-sm text-primary hover:underline"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedOrders.slice(0, 4).map((order) => (
                <div
                  key={order._id}
                  className="border border-border/50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewOrder(order._id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerId?.fullname}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      order.orderStatus === 'delivered' 
                        ? 'bg-green-100 text-green-700'
                        : order.orderStatus === 'out_for_delivery'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    ₹{order.totalAmount?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
