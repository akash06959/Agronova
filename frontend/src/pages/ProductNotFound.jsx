import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProductNotFound() {
  return (
    <motion.div 
      className="min-h-screen bg-gray-50 flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-4xl mb-4"
        >
          
        </motion.div>
        
        <motion.h1 
          className="text-2xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Product Not Available
        </motion.h1>
        
        <motion.p 
          className="text-sm text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Sorry, this product is not currently available in our store.
        </motion.p>
        
        <motion.div 
          className="space-y-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm"
          >
            <span>Browse Products</span>
            <span></span>
          </Link>
          
          <div>
            <Link 
              to="/ecommerce"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Back to Shop
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-blue-50 rounded-lg p-3 border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm"></span>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-800 mb-1">Tip:</p>
              <p className="text-xs text-gray-600">
                Try our <Link to="/soil" className="text-green-600 hover:text-green-700 font-medium">soil analysis</Link> for crop recommendations.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-4 grid grid-cols-3 gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link 
            to="/soil"
            className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="text-lg mb-1"></div>
            <h3 className="font-medium text-gray-900 text-xs">Soil Analysis</h3>
          </Link>
          
          <Link 
            to="/products"
            className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="text-lg mb-1"></div>
            <h3 className="font-medium text-gray-900 text-xs">All Products</h3>
          </Link>
          
          <Link 
            to="/ecommerce"
            className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="text-lg mb-1"></div>
            <h3 className="font-medium text-gray-900 text-xs">Shop Home</h3>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
