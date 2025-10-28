import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useProducts } from "../../contexts/ProductContext";
import { useUsers } from "../../contexts/UserContext";

export default function ProductAnalysis() {
  const { admin } = useAdminAuth();
  const { products } = useProducts();
  const { users } = useUsers();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);

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

  // Calculate REAL analytics data from backend (no mock data)
  useEffect(() => {
    if (products.length >= 0 && users.length >= 0) {
      const calculateAnalytics = () => {
        // REAL CALCULATIONS ONLY - No mock data
        
        // Total Products (REAL)
        const totalProducts = products.length;
        
        // Total Users (REAL)
        const totalUsers = users.length;
        
        // Total Product Value (REAL) - Sum of all product prices
        const totalProductValue = products.reduce((sum, product) => sum + product.price, 0);
        
        // Average Product Price (REAL)
        const avgProductPrice = totalProducts > 0 ? totalProductValue / totalProducts : 0;
        
        // Products by Category (REAL)
        const categoryMap = {};
        products.forEach(product => {
          const category = product.category || 'Uncategorized';
          if (!categoryMap[category]) {
            categoryMap[category] = { count: 0, totalValue: 0, products: [] };
          }
          categoryMap[category].count += 1;
          categoryMap[category].totalValue += product.price;
          categoryMap[category].products.push(product);
        });

        const categoryPerformance = Object.entries(categoryMap).map(([category, data]) => ({
          category,
          productCount: data.count,
          totalValue: data.totalValue,
          avgPrice: data.totalValue / data.count,
          products: data.products
        }));

        // Inventory Status (REAL)
        const inventoryStatus = products.map(product => {
          const stock = product.stock || 0;
          let status = 'good';
          if (stock === 0) status = 'out_of_stock';
          else if (stock < 10) status = 'low';
          else if (stock < 25) status = 'medium';

          return {
            product: product.name,
            stock: stock,
            status: status,
            price: product.price,
            category: product.category || 'Uncategorized'
          };
        });

        // Stock Summary (REAL)
        const stockSummary = {
          totalStock: products.reduce((sum, product) => sum + (product.stock || 0), 0),
          outOfStock: products.filter(p => (p.stock || 0) === 0).length,
          lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length,
          inStock: products.filter(p => (p.stock || 0) >= 10).length
        };

        return {
          // REAL METRICS ONLY
          totalProducts,
          totalUsers,
          totalProductValue,
          avgProductPrice,
          stockSummary,
          categoryPerformance,
          inventoryStatus,
          
          // User engagement (REAL)
          userEngagement: {
            totalUsers,
            registeredToday: users.filter(user => {
              const created = new Date(user.created_at);
              const today = new Date();
              return created.toDateString() === today.toDateString();
            }).length,
            registeredThisWeek: users.filter(user => {
              const created = new Date(user.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return created >= weekAgo;
            }).length,
            registeredThisMonth: users.filter(user => {
              const created = new Date(user.created_at);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return created >= monthAgo;
            }).length
          }
        };
      };

      setAnalyticsData(calculateAnalytics());
    }
  }, [products, users]);

  const getStatusColor = (status) => {
    switch (status) {
      case "good": return "text-green-600 bg-green-100";
      case "low": return "text-yellow-600 bg-yellow-100";
      case "out_of_stock": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };



  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into product performance and trends</p>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* REAL Key Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProducts}</p>
                <p className="text-xs text-gray-500">In catalog</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
                <p className="text-xs text-gray-500">Registered</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Product Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{analyticsData.totalProductValue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Sum of all prices</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Product Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{analyticsData.avgProductPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Per product</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* REAL Data Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Stock Summary */}
          <motion.div variants={slideIn} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600">Total Stock</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((analyticsData.stockSummary.totalStock / 200) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{analyticsData.stockSummary.totalStock} units</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600">In Stock</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((analyticsData.stockSummary.inStock / analyticsData.totalProducts) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{analyticsData.stockSummary.inStock} products</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600">Low Stock</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((analyticsData.stockSummary.lowStock / analyticsData.totalProducts) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{analyticsData.stockSummary.lowStock} products</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600">Out of Stock</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((analyticsData.stockSummary.outOfStock / analyticsData.totalProducts) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{analyticsData.stockSummary.outOfStock} products</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Performance */}
          <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h2>
            <div className="space-y-4">
              {analyticsData.categoryPerformance.map((category, index) => (
                <div key={category.category} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-600">{category.category}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((category.totalValue / analyticsData.totalProductValue) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">₹{category.totalValue.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{category.productCount} products</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* REAL Product Data */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* All Products */}
          <motion.div variants={slideIn} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Products</h2>
            <div className="space-y-4">
              {analyticsData.inventoryStatus.map((product, index) => (
                <div key={product.product} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.product}</p>
                    <p className="text-sm text-gray-500">{product.category} • Stock: {product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">₹{product.price.toFixed(2)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stock Alerts */}
          <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h2>
            <div className="space-y-4">
              {analyticsData.inventoryStatus.filter(item => item.status === 'out_of_stock' || item.status === 'low').map((item, index) => (
                <div key={item.product} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-sm">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product}</p>
                    <p className="text-sm text-gray-500">Stock: {item.stock} units • {item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {analyticsData.inventoryStatus.filter(item => item.status === 'out_of_stock' || item.status === 'low').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl">✅</span>
                  <p className="mt-2">All products are well stocked!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* REAL User Engagement Metrics */}
        <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Registration Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analyticsData.userEngagement.totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analyticsData.userEngagement.registeredToday}</div>
              <div className="text-sm text-gray-500">Registered Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.userEngagement.registeredThisWeek}</div>
              <div className="text-sm text-gray-500">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.userEngagement.registeredThisMonth}</div>
              <div className="text-sm text-gray-500">This Month</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
