import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useUsers } from "../../contexts/UserContext";
import { useProducts } from "../../contexts/ProductContext";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const { users } = useUsers();
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/admin/all`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Simple animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // REAL data calculations
  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
  };

  const recentUsers = users.slice(0, 5).map(user => ({
    id: user.id,
    username: user.username,
    email: user.email || 'No email',
    lastLogin: 'Recently registered',
    status: 'active'
  }));

  // Real products from database (no fake sales data)
  const topProducts = products.slice(0, 5).map((product, index) => ({
    name: product.name,
    price: product.price,
    stock: product.stock || 0,
    category: product.category || 'Uncategorized'
  }));

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" 
      variants={container} 
      initial="hidden" 
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {admin ? admin.username : 'Admin'}! Here's your overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-800">Super Admin</p>
                <p className="text-xs text-purple-600">Full Access</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Registered users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500">In catalog</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🛒</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">{ordersLoading ? 'Loading...' : `${orders.length} total orders`}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">₹</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Product Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{ordersLoading ? 'Loading...' : `From ${orders.length} orders`}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/products"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</span>
                <span className="text-sm font-medium text-gray-700">Manage Products</span>
              </Link>
              <Link
                to="/admin/users"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                <span className="text-sm font-medium text-gray-700">View Users</span>
              </Link>
              <Link
                to="/admin/analytics"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                <span className="text-sm font-medium text-gray-700">Analytics</span>
              </Link>
              <Link
                to="/admin/orders"
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
                <span className="text-sm font-medium text-gray-700">Orders</span>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <motion.div variants={fadeUp}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                <Link to="/admin/users" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{user.lastLogin}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div variants={fadeUp}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <Link to="/admin/analytics" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View Analytics
                </Link>
              </div>
              <div className="space-y-3">
                {topProducts.length > 0 ? topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category} • Stock: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{product.price.toFixed(2)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl">📦</span>
                    <p className="mt-2">No products yet</p>
                    <p className="text-sm">Add some products to see them here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}