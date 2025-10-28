import { motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, clearWishlist, isInCart } = useCart();
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

  if (wishlist.items.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div 
            variants={fadeUp}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">❤️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-6">Save items you love for later by adding them to your wishlist.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <span>Start Shopping</span>
              <span>→</span>
            </Link>
          </motion.div>
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
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">{wishlist.items.length} item(s) saved for later</p>
            </div>
            <button
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear Wishlist
            </button>
          </div>
        </motion.div>

        {/* Wishlist Items */}
        <motion.div 
          variants={fadeUp}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {wishlist.items.map((item) => (
            <motion.div
              key={item.id}
              variants={slideIn}
              whileHover={{ y: -2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="relative">
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                    {item.badge}
                  </span>
                </div>

                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-colors"
                >
                  <span className="text-red-500 text-sm">❤️</span>
                </button>

                {/* Quick Add to Cart Button */}
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-green-600 text-white p-1.5 rounded-full shadow-sm hover:bg-green-700 transition-colors"
                  >
                    <span className="text-sm">+</span>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{item.category}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{item.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({item.reviews})</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                  <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                  <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                    {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {isInCart(item.id) ? (
                    <div className="w-full bg-gray-100 text-gray-600 py-2 rounded text-xs font-medium text-center">
                      Already in Cart
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        addToCart(item, 1);
                      }}
                      className="w-full bg-green-600 text-white py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                  
                  <Link
                    to={`/product/${item.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "")}`}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded text-xs font-medium hover:bg-gray-200 transition-colors text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Move All to Cart */}
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <button
            onClick={() => {
              wishlist.items.forEach(item => addToCart(item));
              clearWishlist();
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Move All to Cart
          </button>
        </motion.div>

        {/* Recommended Products */}
        <motion.div variants={fadeUp} className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">More items you might like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                name: "Premium Rice Seeds",
                price: 249,
                image: "https://images.unsplash.com/photo-1524592714635-d77511a4834a?q=80&w=200&auto=format&fit=crop"
              },
              {
                name: "Garden Spade",
                price: 899,
                image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=200&auto=format&fit=crop"
              },
              {
                name: "Planting Pots Set",
                price: 299,
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=200&auto=format&fit=crop"
              },
              {
                name: "Watering System",
                price: 1299,
                image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=200&auto=format&fit=crop"
              }
            ].map((product, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="h-24 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-xs mb-1">{product.name}</h3>
                  <p className="text-green-600 font-bold text-sm">₹{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}



