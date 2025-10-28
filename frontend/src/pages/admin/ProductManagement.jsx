import { motion } from "framer-motion";
import { useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useProducts } from "../../contexts/ProductContext";
import { useNotification } from "../../contexts/NotificationContext";

export default function ProductManagement() {
  const { admin } = useAdminAuth();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

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

  // products come from ProductContext

  const categories = ["Vegetables", "Grains", "Fruits", "Herbs", "Flowers"];
  const statusOptions = ["active", "inactive", "out_of_stock", "draft"];

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    short_description: "",
    image: "",
    status: "active",
    featured: false,
    tags: "",
    weight: "",
    dimensions: "",
    sku: "",
    meta_title: "",
    meta_description: "",
    seo_keywords: ""
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: name,
      slug: generateSlug(name),
      meta_title: name ? `${name} - AgroNova` : "",
      meta_description: name ? `Buy ${name.toLowerCase()} for your garden. Premium quality guaranteed.` : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      const updateData = { ...editingProduct, ...formData };
      const result = await updateProduct(updateData);
      if (result?.success) {
        showSuccessNotification("Product Updated", `${formData.name} has been updated successfully!`);
      } else {
        showErrorNotification("Update Failed", result?.error || "Failed to update product. Changes saved locally only.");
      }
      setEditingProduct(null);
    } else {
      const result = await addProduct(formData);
      if (result?.success) {
        showSuccessNotification("Product Added", `${formData.name} has been added successfully!`);
      } else {
        showErrorNotification("Added locally", "Backend not reachable; product stored locally only.");
      }
    }
    
    setFormData({
      name: "",
      slug: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      short_description: "",
      image: "",
      status: "active",
      featured: false,
      tags: "",
      weight: "",
      dimensions: "",
      sku: "",
      meta_title: "",
      meta_description: "",
      seo_keywords: ""
    });
    setShowAddForm(false);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || '',
      price: product.price ? product.price.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      description: product.description || '',
      short_description: product.short_description || '',
      image: product.image || '',
      status: product.status || 'active',
      featured: product.featured || false,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      sku: product.sku || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      seo_keywords: product.seo_keywords || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      const result = await deleteProduct(productId);
      if (result.success) {
        showSuccessNotification("Product Deleted", `${productName} has been deleted successfully!`);
      } else {
        showErrorNotification("Delete Failed", result.error || "Failed to delete product");
      }
    }
  };

  const toggleStatus = async (productId, currentStatus, productName) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const result = await updateProduct(productId, { status: newStatus });
    if (result.success) {
      showSuccessNotification("Status Updated", `${productName} status changed to ${newStatus}!`);
    } else {
      showErrorNotification("Status Update Failed", result.error || "Failed to update product status");
    }
  };

  const toggleFeatured = async (productId, currentFeatured, productName) => {
    const result = await updateProduct(productId, { featured: !currentFeatured });
    if (result.success) {
      showSuccessNotification("Featured Status Updated", `${productName} featured status changed!`);
    } else {
      showErrorNotification("Featured Status Update Failed", result.error || "Failed to update product featured status");
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (productIds, newStatus) => {
    const promises = productIds.map(id => updateProduct(id, { status: newStatus }));
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === productIds.length) {
      showSuccessNotification("Bulk Update", `${successCount} products status changed to ${newStatus}!`);
    } else {
      showErrorNotification("Bulk Update Partial", `${successCount}/${productIds.length} products updated successfully`);
    }
  };

  const handleBulkDelete = async (productIds) => {
    if (window.confirm(`Are you sure you want to delete ${productIds.length} products? This action cannot be undone.`)) {
      const promises = productIds.map(id => deleteProduct(id));
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === productIds.length) {
        showSuccessNotification("Bulk Delete", `${successCount} products deleted successfully!`);
      } else {
        showErrorNotification("Bulk Delete Partial", `${successCount}/${productIds.length} products deleted successfully`);
      }
    }
  };

  // Duplicate product
  const handleDuplicate = async (product) => {
    const duplicateData = {
      ...product,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`,
      sku: product.sku ? `${product.sku}-copy` : undefined
    };
    
    const result = await addProduct(duplicateData);
    if (result.success) {
      showSuccessNotification("Product Duplicated", `${duplicateData.name} has been created!`);
    } else {
      showErrorNotification("Duplicate Failed", result.error || "Failed to duplicate product");
    }
  };

  // Quick stock update
  const handleQuickStockUpdate = async (productId, newStock, productName) => {
    const result = await updateProduct(productId, { stock: parseInt(newStock) });
    if (result.success) {
      showSuccessNotification("Stock Updated", `${productName} stock updated to ${newStock}!`);
    } else {
      showErrorNotification("Stock Update Failed", result.error || "Failed to update product stock");
    }
  };

  // Product selection handlers
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "stock":
          return a.stock - b.stock;
        case "created_at":
          return new Date(b.created_at) - new Date(a.created_at);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" 
      variants={container} 
      initial="hidden" 
      animate="show"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Django-style Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your product catalog and inventory</p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingProduct(null);
                setFormData({
                  name: "",
                  slug: "",
                  category: "",
                  price: "",
                  stock: "",
                  description: "",
                  short_description: "",
                  image: "",
                  status: "active",
                  featured: false,
                  tags: "",
                  weight: "",
                  dimensions: "",
                  sku: "",
                  meta_title: "",
                  meta_description: "",
                  seo_keywords: ""
                });
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add New Product
            </button>
          </div>
        </motion.div>

        {/* Django-style Add/Edit Form Modal */}
        {showAddForm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProduct(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Django-style Field Groups */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleNameChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="product-slug"
                        />
                        <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                        <textarea
                          name="short_description"
                          value={formData.short_description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Brief description for listings"
                        />
                      </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Pricing & Inventory</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter price"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter stock quantity"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Product SKU"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                        <input
                          type="text"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 500g, 1kg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                        <input
                          type="text"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 20x15x5 cm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Description</h3>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Detailed product description"
                    />
                  </div>

                  {/* Media & Status */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Media & Status</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter image URL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Featured Product
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Tags & SEO</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="tag1, tag2, tag3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                        <input
                          type="text"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="SEO title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                        <textarea
                          name="meta_description"
                          value={formData.meta_description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="SEO description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords</label>
                        <input
                          type="text"
                          name="seo_keywords"
                          value={formData.seo_keywords}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Django-style Filters and Search */}
        <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="created_at">Sort by Date</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <motion.div variants={fadeUp} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkStatusChange(selectedProducts, 'active')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange(selectedProducts, 'inactive')}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkDelete(selectedProducts)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Django-style Products Table */}
        <motion.div variants={fadeUp} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-lg">📦</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.short_description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                            <span className="text-xs text-gray-400">Slug: {product.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">₹{product.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stock > 50 ? 'text-green-600' : 
                        product.stock > 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
                        <p className="text-xs text-gray-500">by {product.created_by}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          ✏️
                        </button>
                        
                        {/* Status Toggle */}
                        <button
                          onClick={() => toggleStatus(product.id, product.status, product.name)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.status === 'active' 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {product.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        
                        {/* Featured Toggle */}
                        <button
                          onClick={() => toggleFeatured(product.id, product.featured, product.name)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.featured 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                          title={product.featured ? 'Remove from Featured' : 'Add to Featured'}
                        >
                          ⭐
                        </button>
                        
                        {/* Duplicate Button */}
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          📋
                        </button>
                        
                        {/* Quick Stock Edit */}
                        <button
                          onClick={() => setEditingStock(product.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Quick Stock Edit"
                        >
                          📦
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div variants={fadeUp} className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}

        {/* Quick Stock Edit Modal */}
        {editingStock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Quick Stock Edit</h3>
              {(() => {
                const product = products.find(p => p.id === editingStock);
                return product ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">Product: {product.name}</p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        defaultValue={product.stock}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newStock = parseInt(e.target.value);
                            if (!isNaN(newStock) && newStock >= 0) {
                              handleQuickStockUpdate(product.id, newStock, product.name);
                              setEditingStock(null);
                            }
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[type="number"]');
                          const newStock = parseInt(input.value);
                          if (!isNaN(newStock) && newStock >= 0) {
                            handleQuickStockUpdate(product.id, newStock, product.name);
                            setEditingStock(null);
                          }
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                      >
                        Update Stock
                      </button>
                      <button
                        onClick={() => setEditingStock(null)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}