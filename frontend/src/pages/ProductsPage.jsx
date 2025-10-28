import { motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useNotification } from "../contexts/NotificationContext";
import { useProducts } from "../contexts/ProductContext";
import { useAuth } from "../contexts/AuthContext";

// Products now come from ProductContext (backend-driven)

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const { addToCart, addToWishlist, isInWishlist, clearCart } = useCart();
  const { showCartNotification, showWishlistNotification } = useNotification();
  const { activeProducts: allProducts, loading, getCategoryStats } = useProducts();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  
  // Update selectedCategory when URL parameter changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);
  
  // Filter products by category
  const products = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

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
      transition: { staggerChildren: 0.05 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 space-y-8" 
        variants={container} 
        initial="hidden" 
        animate="show"
      >
        {/* Enhanced Breadcrumb */}
        <motion.div variants={fadeUp} className="mb-6">
          <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <div className="flex items-center space-x-2">
              {/* Shop Link */}
              <Link 
                to="/ecommerce" 
                className="group flex items-center space-x-1 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="text-green-600 group-hover:text-green-700 font-medium">🏪</span>
                <span className="text-gray-700 group-hover:text-green-700 font-medium">Shop</span>
              </Link>
              
              {/* Arrow Separator */}
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Current Page - Products */}
              <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-sm">
                <span className="text-green-600 font-medium">📦</span>
                <span className="text-gray-800 font-semibold">Products</span>
              </div>
            </div>
          </nav>
        </motion.div>

        <motion.div variants={fadeUp} className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Premium agricultural products for your farming needs</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchParams({});
              }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-sm hover:shadow-md'
              }`}
            >
              All Products ({allProducts.length})
            </button>
            {getCategoryStats().map((categoryData) => (
              <button
                key={categoryData.category}
                onClick={() => {
                  setSelectedCategory(categoryData.category);
                  setSearchParams({ category: categoryData.category });
                }}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === categoryData.category
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50 shadow-sm hover:shadow-md'
                }`}
              >
                {categoryData.category} ({categoryData.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid or Empty State */}
        {products.length === 0 && !loading ? (
          <motion.div variants={fadeUp} className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedCategory === 'all' 
                ? 'No products available' 
                : `No products in ${selectedCategory} category`
              }
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              {selectedCategory === 'all' 
                ? 'Check back later for new products.' 
                : 'Try selecting a different category or browse all products.'
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchParams({});
                }}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                View All Products
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            variants={fadeUp}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {(loading ? [] : products).map((product) => (
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
