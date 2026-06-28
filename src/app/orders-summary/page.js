'use client';

import { useState, useEffect } from "react";
import { Package, MapPin, Phone, User, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Store } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { toast } from "react-hot-toast";

export default function OrdersSummary() {
  const [activeTab, setActiveTab] = useState("available");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { 
    getAvailableOrders, 
    getAssignedOrders, 
    acceptOrder, 
    rejectOrder,
    isLoading,
    error 
  } = useOrders();

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "available") {
        response = await getAvailableOrders();
      } else {
        response = await getAssignedOrders();
      }
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptOrder(orderId);
      loadOrders();
      toast.success('Order accepted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await rejectOrder(orderId, reason || '');
      loadOrders();
      toast.success('Order rejected');
    } catch (err) {
      toast.error(err.message || 'Failed to reject order');
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
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Orders
          </h1>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "available"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Available Orders
          </button>
          <button
            onClick={() => setActiveTab("assigned")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "assigned"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Orders
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Orders List */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-border/50 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {order.orderNumber}
                      </h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded-md mt-1 ${getStatusColor(order.orderStatus)}`}>
                        {formatStatus(order.orderStatus)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        ₹{order.totalAmount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {order.customerId?.fullname || 'Customer'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {order.customerId?.phone || 'N/A'}
                      </span>
                    </div>
                    {order.distance && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {order.distance.toFixed(1)} km away
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  {order.shopId && (
                    <div className="p-2 bg-muted/50 rounded-lg mb-3">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Shop</p>
                          <p className="text-sm font-medium text-foreground">
                            {order.shopId.fullname}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {activeTab === "available" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order._id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === "assigned" && (
                    <div className="mt-4">
                      <button
                        onClick={() => window.location.href = `/orders/${order._id}`}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
