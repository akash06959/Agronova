import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { cart, wishlist, getCartTotal, getCartItemsCount, getWishlistCount } = useCart();
  
  // Check if user has invalid ID (timestamp-based from old login)
  const hasInvalidId = user?.id && user.id > 999999999;
  
  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Edit profile functions
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        username: user?.username || '',
        email: user?.email || '',
        fullName: user?.fullName || ''
      });
    }
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        // Small delay before refresh to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.detail || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const slideIn = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
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

  // Show warning if user has invalid session
  if (hasInvalidId) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Update Required</h1>
          <p className="text-gray-600 mb-6">
            Your session needs to be refreshed. Please log out and log back in to continue using the platform.
          </p>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg text-lg"
          >
            Log Out & Log In Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50" 
      variants={container} 
      initial="hidden" 
      animate="show"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Welcome back, {user.username}!</h1>
                    <p className="text-emerald-50">Manage your account and track your activity</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <motion.div variants={slideIn} className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-xl border border-emerald-100 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Account Information
                </h2>
                {!isEditing && (
                  <button 
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.fullName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-6 pt-4 flex gap-3">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleEditToggle}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cart Items</p>
                    <p className="text-3xl font-bold text-gray-900">{getCartItemsCount()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200 shadow-lg p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Wishlist</p>
                    <p className="text-3xl font-bold text-gray-900">{getWishlistCount()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-lg p-5 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">₹</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Cart Total</p>
                    <p className="text-2xl font-bold text-gray-900">₹{getCartTotal()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/cart"
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-100 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-3xl mb-2">🛒</span>
                  <span className="text-sm font-bold text-gray-800">View Cart</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200 hover:border-red-400 hover:bg-red-100 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-3xl mb-2">❤️</span>
                  <span className="text-sm font-bold text-gray-800">Wishlist</span>
                </Link>
                <Link
                  to="/products"
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-3xl mb-2">🛍️</span>
                  <span className="text-sm font-bold text-gray-800">Shop Now</span>
                </Link>
                <Link
                  to="/soil"
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-3xl mb-2">🌱</span>
                  <span className="text-sm font-bold text-gray-800">Soil Check</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp} className="mt-8">
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xl border border-blue-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Recent Activity
            </h2>
            <div className="space-y-3">
              {cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 shadow-md">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">Qty: {item.quantity} • ₹{item.price * item.quantity}</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm shadow-sm">🛒 In Cart</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🛒</span>
                  <p className="text-gray-500">No recent activity</p>
                  <Link
                    to="/products"
                    className="inline-block mt-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Order History Placeholder */}
        <motion.div variants={fadeUp} className="mt-8">
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-xl border border-purple-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Order History
            </h2>
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📦</span>
              <p className="text-gray-500 mb-4">No orders yet</p>
              <p className="text-sm text-gray-400 mb-6">Your completed orders will appear here</p>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                View All Orders →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}



