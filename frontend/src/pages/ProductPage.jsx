import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useNotification } from "../contexts/NotificationContext";
import { useProducts } from "../contexts/ProductContext";
import { useAuth } from "../contexts/AuthContext";

// Products now come from ProductContext (backend-driven)

// Component for Product Image Gallery with SQUARE aspect ratio
const ProductImageGallery = ({ product, variants }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle both backend products (single image) and hardcoded products (multiple images)
  const images = product.images ? [product.image] : [product.image || "https://via.placeholder.com/300x200?text=No+Image"];
  const productImages = Array.isArray(product.images) ? product.images : images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <motion.div variants={variants} className="space-y-4">
      {/* Main Image Display - Enhanced with better styling */}
      <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl border-4 border-white">
        <img 
          src={productImages[currentImageIndex]} 
          alt={`${product.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover bg-white hover:scale-110 transition-transform duration-500 ease-out"
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10 hover:scale-110"
            >
              <span className="text-gray-700 text-lg font-bold">‹</span>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10 hover:scale-110"
            >
              <span className="text-gray-700 text-lg font-bold">›</span>
            </button>
          </>
        )}
        
        {/* Image Counter - Only show if multiple images */}
        {productImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentImageIndex + 1} / {productImages.length}
          </div>
        )}
        
        {/* Featured Badge Overlay */}
        {product.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            ⭐ Featured
          </div>
        )}
      </div>
      
      {/* Thumbnail Navigation - Only show if multiple images */}
      {productImages.length > 1 && (
        <div className="flex gap-2 justify-center">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-12 h-12 rounded-xl overflow-hidden border-3 transition-all duration-300 hover:scale-110 ${
                index === currentImageIndex 
                  ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-gray-400 shadow-md'
              }`}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Component for Product Header
const ProductHeader = ({ product, variants }) => (
  <motion.div variants={variants} className="space-y-4">
    {/* Badge and Category */}
    <div className="flex items-center gap-2 flex-wrap">
      {product.featured && (
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          ⭐ Featured
        </span>
      )}
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
        {product.category || 'Product'}
      </span>
      {product.sku && (
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-mono">
          SKU: {product.sku}
        </span>
      )}
    </div>
    
    {/* Product Title */}
    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
      {product.name}
    </h1>
    
    {/* Rating and Reviews */}
    <div className="flex items-center gap-3">
      <div className="flex text-yellow-400 text-lg">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(product.rating || 4.5) ? "text-yellow-400" : "text-gray-300"}>
            ⭐
          </span>
        ))}
      </div>
      <span className="text-lg font-semibold text-gray-700">{product.rating || 4.5}</span>
      <span className="text-sm text-gray-500">({product.reviews || 0} reviews)</span>
    </div>
    
    {/* Stock Status */}
    <div className="flex items-center gap-2">
      {product.stock > 0 ? (
        <span className="flex items-center gap-1 text-green-600 font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          In Stock ({product.stock} available)
        </span>
      ) : (
        <span className="flex items-center gap-1 text-red-600 font-medium">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Out of Stock
        </span>
      )}
    </div>
    
    {/* Short Description */}
    {product.short_description && (
      <p className="text-gray-600 leading-relaxed text-lg">
        {product.short_description}
      </p>
    )}
  </motion.div>
);

// Component for Pricing Section
const PricingSection = ({ product, quantity, setQuantity, variants }) => (
  <motion.div variants={variants} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="space-y-3">
      {/* Price Display */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-medium">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          </>
        )}
      </div>
      
      {/* Stock Status */}
      {product.stock !== undefined && (
        <div className="text-sm text-gray-600">
          {product.stock > 0 ? (
            <span className="text-green-600">✓ In Stock ({product.stock} available)</span>
          ) : (
            <span className="text-red-600">✗ Out of Stock</span>
          )}
        </div>
      )}
      
      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Qty:</label>
        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
          >
            
          </button>
          <span className="px-3 py-1 bg-white font-medium text-sm min-w-[40px] text-center">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
          >
            +
          </button>
        </div>
        <span className="text-sm font-medium text-gray-700">
          Total: ₹{product.price * quantity}
        </span>
      </div>
    </div>
  </motion.div>
);

// Component for Action Buttons
const ActionButtons = ({ product, quantity, variants, handleAddToCart, handleAddToWishlist, isInWishlist, onBuyNow }) => {
  return (
    <motion.div variants={variants} className="space-y-3">
      <button 
        onClick={() => handleAddToCart(product, quantity)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        🛒 Add to Cart - ₹{product.price * quantity}
    </button>
      
      <button 
        onClick={() => onBuyNow(product, quantity)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        ⚡ Buy Now
    </button>
      
      <button 
        onClick={() => handleAddToWishlist(product)}
        className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
          isInWishlist(product.id)
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
        }`}
      >
        {isInWishlist(product.id) ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
    </button>
  </motion.div>
);
};

// Component for Features List
const FeaturesList = ({ product, variants }) => {
  // Handle both backend products and hardcoded products
  const features = product.features || [];
  
  return (
    <motion.div variants={variants} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
      <div className="space-y-2">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-600 text-sm mt-0.5"></span>
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 italic">No features listed for this product.</div>
        )}
      </div>
    </motion.div>
  );
};

// Component for Product Specifications
const ProductSpecifications = ({ product, variants }) => {
  const getStatusDisplay = (status, stock) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600", icon: "📦" };
    if (status === 'inactive') return { text: "Temporarily Unavailable", color: "text-yellow-600", icon: "⏸️" };
    if (status === 'out_of_stock') return { text: "Out of Stock", color: "text-red-600", icon: "📦" };
    return { text: "Available", color: "text-green-600", icon: "✅" };
  };

  const statusDisplay = getStatusDisplay(product.status, product.stock);

  const specifications = [
    { label: "Category", value: product.category || "N/A" },
    { label: "Weight", value: product.weight || "N/A" },
    { label: "Dimensions", value: product.dimensions || "N/A" },
    { label: "Stock", value: product.stock || 0 },
    { 
      label: "Availability", 
      value: statusDisplay.text,
      color: statusDisplay.color,
      icon: statusDisplay.icon
    }
  ];

  const technicalSpecs = [
    { label: "SKU", value: product.sku || "N/A", description: "Stock Keeping Unit - unique product identifier" }
  ];
  
  return (
    <motion.div variants={variants} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-green-600">📋</span>
        Product Specifications
      </h3>
      
      {/* Main Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {specifications.map((spec, index) => (
          <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">{spec.label}:</span>
            <span className={`font-semibold flex items-center gap-1 ${spec.color || 'text-gray-900'}`}>
              {spec.icon && <span>{spec.icon}</span>}
              {spec.value}
            </span>
          </div>
        ))}
      </div>

      {/* Technical Specifications (Collapsible) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2">
          <span className="group-open:rotate-90 transition-transform">▶</span>
          Technical Details
        </summary>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-3">
            {technicalSpecs.map((spec, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600 text-sm">{spec.label}:</span>
                  <span className="text-xs text-gray-500">{spec.description}</span>
                </div>
                <span className="text-gray-700 font-mono text-sm">{spec.value}</span>
              </div>
            ))}
          </div>
            </div>
      </details>
    </motion.div>
  );
};

// Component for Product Tags
const ProductTags = ({ product, variants }) => {
  const tags = product.tags ? 
    (typeof product.tags === 'string' ? product.tags.split(',').map(tag => tag.trim()) : product.tags) 
    : [];

  if (tags.length === 0) return null;

  return (
    <motion.div variants={variants} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-blue-600">🏷️</span>
        Product Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Component for Detailed Product Information
const DetailedProductInfo = ({ product, variants }) => {
  return (
    <motion.div variants={variants} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-purple-600">📝</span>
        Product Details
      </h3>
      
      {/* Short Description */}
      {product.short_description && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Overview</h4>
          <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
        </div>
      )}
      
      {/* Full Description */}
      {product.description && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Description</h4>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}
      
      {/* SEO Information (for admin/debug purposes) */}
      {(product.meta_title || product.meta_description) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">SEO Information</h4>
          {product.meta_title && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-600">Meta Title:</span>
              <p className="text-sm text-gray-500">{product.meta_title}</p>
            </div>
          )}
          {product.meta_description && (
            <div>
              <span className="text-sm font-medium text-gray-600">Meta Description:</span>
              <p className="text-sm text-gray-500">{product.meta_description}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Component for Related Products - Removed per user request
/*
const RelatedProducts = ({ variants }) => (
  <motion.div variants={variants} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Products</h3>
    <div className="grid grid-cols-3 gap-3">
      {[
        { name: "Organic Fertilizer", price: "₹599", image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=200&auto=format&fit=crop" },
        { name: "Garden Tools", price: "₹1,299", image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=200&auto=format&fit=crop" },
        { name: "Planting Pots", price: "₹199", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=200&auto=format&fit=crop" }
      ].map((item, index) => (
        <div key={index} className="group cursor-pointer">
          <div className="bg-gray-100 rounded overflow-hidden mb-2">
            <img src={item.image} alt={item.name} className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <h4 className="font-medium text-gray-900 text-xs mb-1">{item.name}</h4>
          <p className="text-green-600 font-semibold text-xs">{item.price}</p>
        </div>
      ))}
    </div>
  </motion.div>
);
*/

export default function ProductPage() {
  const { cropName } = useParams();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist, clearCart } = useCart();
  const { showCartNotification, showWishlistNotification } = useNotification();
  const { products, loading, error } = useProducts();
  const { user } = useAuth();

  const handleBuyNow = (product, quantity) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    // Clear existing cart and add only this product
    clearCart();
    addToCart(product, quantity);
    showCartNotification(product.name);
    // Navigate to payment page
    navigate('/payment');
  };

  const handleAddToCart = (product, quantity) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
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
  
  // Find product by slug from backend
  const product = products.find(p => p.slug === cropName);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-solid mb-4"></div>
          <p className="text-gray-700 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }
  
  if (!product) {
    // If products are still loading, show loading state
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-solid mb-4"></div>
            <p className="text-gray-700 text-lg">Loading product...</p>
          </div>
        </div>
      );
    }
    
    // If products are loaded but product not found, redirect to not found page
    window.location.href = "/product-not-found";
    return null;
  }

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
              
              {/* Products Link */}
              <Link 
                to="/products" 
                className="group flex items-center space-x-1 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="text-green-600 group-hover:text-green-700 font-medium">📦</span>
                <span className="text-gray-700 group-hover:text-green-700 font-medium">Products</span>
              </Link>
              
              {/* Arrow Separator */}
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Current Product */}
              <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-sm">
                <span className="text-green-600 font-medium">🌱</span>
                <span className="text-gray-800 font-semibold truncate max-w-xs">{product.name}</span>
              </div>
            </div>
          </nav>
        </motion.div>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image - PERFECT SQUARE */}
          <ProductImageGallery product={product} variants={fadeUp} />

          {/* Product Details */}
          <div className="space-y-4">
            <ProductHeader product={product} variants={fadeUp} />
            <PricingSection product={product} quantity={quantity} setQuantity={setQuantity} variants={fadeUp} />
            <ActionButtons 
              product={product} 
              quantity={quantity} 
              variants={fadeUp}
              handleAddToCart={handleAddToCart}
              handleAddToWishlist={handleAddToWishlist}
              isInWishlist={isInWishlist}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>

        {/* Product Information Sections */}
        <div className="space-y-8">
          {/* Product Specifications */}
          <ProductSpecifications product={product} variants={fadeUp} />
          
          {/* Product Tags */}
          <ProductTags product={product} variants={fadeUp} />
          
          {/* Detailed Product Information */}
          <DetailedProductInfo product={product} variants={fadeUp} />
        </div>

        {/* Related Products - Removed per user request */}
      </motion.div>
      </div>
  );
}
