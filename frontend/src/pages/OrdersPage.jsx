import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

export default function OrdersPage() {
  const { user } = useAuth();
  const { showSuccessNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched orders:', data);
        console.log('First order items:', data[0]?.items);
        setOrders(data);
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "confirmed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return "✅";
      case "shipped":
        return "🚚";
      case "confirmed":
        return "✓";
      case "pending":
        return "⏳";
      case "cancelled":
        return "❌";
      default:
        return "📦";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const canCancelOrder = (order) => {
    return order.status === "pending" || order.status === "confirmed";
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancellingOrderId(orderId);
    
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel?user_id=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh orders list
        await fetchOrders();
        showSuccessNotification("Order Cancelled", "Your order has been cancelled successfully");
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to cancel order' }));
        showSuccessNotification("Error", errorData.detail || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      showSuccessNotification("Error", "Error cancelling order. Please try again.", 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to view your orders.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-8 shadow-2xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2">My Orders</h1>
                  <p className="text-emerald-50 text-lg">View and track all your orders</p>
                </div>
              </div>
              <Link
                to="/products"
                className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
              >
                🛍️ Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-16 text-center relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tl from-green-200/30 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">No Orders Yet</h2>
              <p className="text-gray-600 mb-8 text-lg">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl text-lg transform hover:scale-105"
              >
                🛍️ Start Shopping
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 relative group"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-2xl"></div>
                
                {/* Order Header */}
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-8 py-6 border-b-2 border-gray-200 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-gray-900">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span>📅</span> {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className={`px-5 py-2 rounded-2xl text-sm font-bold border-2 shadow-lg ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Cancel Button */}
                      {canCancelOrder(order) && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingOrderId === order.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <span>❌</span>
                                Cancel Order
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-3xl font-extrabold text-green-600 mb-1">₹{order.total_amount}</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500 uppercase">{order.payment_method === 'card' ? '💳 Card' : '💰 COD'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">🛍️</span>
                    <h4 className="text-xl font-bold text-gray-900">Order Items</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {order.items.map((item, itemIndex) => (
                      <motion.div 
                        key={itemIndex} 
                        className="flex items-center gap-4 p-5 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-gray-100 hover:border-green-300 transition-all shadow-lg hover:shadow-xl group"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                          <img
                            src={item.image || "/images/products/placeholder.jpg"}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">₹{item.price * item.quantity}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-2xl">📍</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <span>🚚</span>
                          Delivery Address
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{order.shipping_address}</p>
                        <p className="text-sm font-semibold text-gray-600 mt-1">{order.city}, {order.state} - {order.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

