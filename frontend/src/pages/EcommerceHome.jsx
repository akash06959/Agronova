import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../contexts/ProductContext";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";

// Local images from the shop folder
const HERO_IMG = "/images/shop/hero-bg.jpg";
const SEEDS_IMG = "/images/shop/seeds.png";

// Fixed category list with images
const fixedCategories = [
  { category: "Seeds", image: "/images/shop/seeds.png" },
  { category: "Fruits", image: "/images/shop/fruits.jpg" },
  { category: "Grains", image: "/images/shop/grains.jpg" },
  { category: "Vegetables", image: "/images/shop/vegetables.jpg" }
];

// Category images mapping (fallback)
const categoryImages = {
  "Seeds": "/images/shop/seeds.png",
  "Fruits": "/images/shop/fruits.jpg",
  "Grains": "/images/shop/grains.jpg",
  "Vegetables": "/images/shop/vegetables.jpg",
  "Tools": "/images/shop/seeds.png",
  "Fertilizers": "/images/shop/seeds.png"
};

export default function EcommerceHome() {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist, clearCart } = useCart();
  const { showCartNotification, showWishlistNotification } = useNotification();
  const { featuredProducts, loading, getCategoryStats } = useProducts();
  const { user } = useAuth();

  const handleBuyNow = (product) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    // Clear existing cart and add only this product
    clearCart();
    addToCart(product, 1);
    showCartNotification(product.name);
    // Navigate to payment page
    navigate('/payment');
  };

  const handleAddToCart = (product) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    addToCart(product, 1);
    showCartNotification(product.name);
  };

  const handleAddToWishlist = (product) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    addToWishlist(product);
    showWishlistNotification(product.name);
  };

  const handleProductClick = (product) => {
    // Use product slug for navigation
    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      navigate("/product-not-found");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 space-y-16" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        {/* Hero Section */}
        <motion.section
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border border-green-200"
        >
          <div className="grid lg:grid-cols-2 gap-0 min-h-[500px]">
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <motion.div
                variants={slideIn}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <span>🌱</span>
                  <span>Premium Agricultural Products</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                  Grow Your
                  <span className="text-green-600 block">Dream Harvest</span>
                </h1>

                <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
                  Discover premium seeds, farming tools, and agricultural supplies.
                  Get expert recommendations based on your soil analysis.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>🛒</span>
                    <span>Shop Now</span>
                  </Link>
                  <Link
                    to="/soil"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-green-600 px-6 py-3 font-semibold hover:bg-green-50 border-2 border-green-200 hover:border-green-300 transition-all duration-300"
                  >
                    <span>🔬</span>
                    <span>Analyze Soil</span>
                  </Link>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">10K+</div>
                    <div className="text-sm text-gray-600">Happy Farmers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">500+</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">4.9</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="relative min-h-[300px] lg:min-h-full">
              <img
                src={HERO_IMG}
                alt="Agricultural products"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-green-50/80 to-transparent" />
              
              {/* Floating Stats */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-gray-600">Organic</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Categories Section */}
        <motion.section 
          variants={fadeUp} 
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find everything you need for successful farming
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {fixedCategories.map((categoryData, index) => {
              const categoryStats = getCategoryStats();
              const stats = categoryStats.find(cat => cat.category === categoryData.category) || { count: 0 };
              
              return (
                <motion.div
                  key={categoryData.category}
                  variants={fadeUp}
                  whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/products?category=${encodeURIComponent(categoryData.category)}`)}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="h-32 overflow-hidden">
                      <img
                        src={categoryData.image}
                        alt={categoryData.category}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{categoryData.category}</h3>
                      <p className="text-sm text-gray-600">
                        {stats.count === 1 
                          ? "1 Product" 
                          : `${stats.count} Products`
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Featured Products Section */}
        <motion.section 
          variants={fadeUp} 
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Handpicked premium products for your farming success
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No featured products</h3>
              <p className="text-gray-500 mb-4">Check back later for featured products.</p>
              <Link 
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition-colors"
              >
                <span>🛒</span>
                <span>Browse All Products</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 6).map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                        {product.badge}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button
                        className={`p-2 rounded-full shadow-sm transition-colors ${
                          isInWishlist(product.id)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-white/90 hover:bg-white text-gray-600'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWishlist(product);
                        }}
                      >
                        <span className="text-sm">❤️</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">{product.category}</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="w-full bg-white text-green-600 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-colors border border-green-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          variants={fadeUp} 
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl lg:text-3xl font-bold">
                Ready to Start Your Farming Journey?
              </h3>
              <p className="text-lg text-green-100 max-w-2xl mx-auto">
                Join thousands of farmers who trust AgroNova for their agricultural needs.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-green-600 px-8 py-4 font-semibold hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>🛒</span>
                <span>Shop Products</span>
              </Link>
              <Link 
                to="/soil" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 text-white px-8 py-4 font-semibold hover:bg-green-400 border border-green-400 transition-all duration-300"
              >
                <span>🔬</span>
                <span>Analyze Soil</span>
              </Link>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}