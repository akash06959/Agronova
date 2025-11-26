import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

export default function AdminOrdersPage() {
  const { admin } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/admin/all`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched all orders:', data);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh orders list
        await fetchAllOrders();
        alert(`Order status updated to ${newStatus}`);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update order status' }));
        alert(errorData.detail || 'Failed to update order status');
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Error updating order status. Please try again.");
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  if (!admin) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in as admin to view orders.</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Admin Login
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
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
            onClick={fetchAllOrders}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">📋</span>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2">Orders Management</h1>
                  <p className="text-purple-50 text-lg">Manage all customer orders</p>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-3xl font-extrabold">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-purple-50">Total Revenue</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'confirmed').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'cancelled').length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter and Orders */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {/* Filter Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-gray-900">All Orders</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Filter by status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none font-semibold"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="p-8">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">No orders match the selected filter.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-white to-gray-50 px-8 py-6 border-b-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl">📦</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-extrabold text-gray-900">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                              <span>👤</span> User ID: {order.user_id}
                              <span className="mx-2">•</span>
                              <span>📅</span> {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className={`px-5 py-2 rounded-2xl text-sm font-bold border-2 shadow-lg ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right">
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
                          <div 
                            key={itemIndex} 
                            className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all shadow-lg"
                          >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 shadow-lg">
                              <img
                                src={item.image || "/images/products/placeholder.jpg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.name}</h4>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100 mb-6">
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

                      {/* Status Management */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl">⚙️</span>
                          Order Management
                        </h4>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm font-semibold text-gray-700">Update Status:</span>
                          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              disabled={order.status === status}
                              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                order.status === status
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700 border-2 border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
