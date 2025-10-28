import { motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemsCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div 
          className="max-w-7xl mx-auto px-4 py-8" 
          variants={container} 
          initial="hidden" 
          animate="show"
        >
          <motion.div 
            variants={fadeUp}
            className="text-center py-20"
          >
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-8 py-4 font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>🛒</span>
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 space-y-8" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-lg text-gray-600">{getCartItemsCount()} item(s) in your cart</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                variants={slideIn}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({item.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl font-bold text-green-600">₹{item.price}</span>
                      <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-semibold text-gray-700">Quantity:</label>
                      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 bg-white font-semibold text-sm min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        Total: ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Remove from cart"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Subtotal ({getCartItemsCount()} items)</span>
                  <span className="font-semibold">₹{getCartTotal()}</span>
                </div>
                
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">₹{Math.round(getCartTotal() * 0.18)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₹{getCartTotal() + Math.round(getCartTotal() * 0.18)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/payment')}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🛒 Proceed to Checkout
                </button>
                <Link
                  to="/products"
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center block border border-gray-200"
                >
                  🛍️ Continue Shopping
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-green-600">🔒</span>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommended Products */}
        <motion.div variants={fadeUp} className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              {
                name: "Organic Fertilizer",
                price: 599,
                image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=400&auto=format&fit=crop"
              },
              {
                name: "Garden Tools Set",
                price: 1299,
                image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=400&auto=format&fit=crop"
              },
              {
                name: "Planting Pots",
                price: 199,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop"
              },
              {
                name: "Watering Can",
                price: 399,
                image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=400&auto=format&fit=crop"
              }
            ].map((product, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{product.name}</h3>
                  <p className="text-green-600 font-bold text-lg">₹{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
