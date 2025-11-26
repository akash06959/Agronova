import { createContext, useContext, useReducer, useEffect } from 'react';

const ProductContext = createContext();

const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        loading: false
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  products: [],
  loading: true,
  error: null
};

// Default products that will be shown on user side
const defaultProducts = [
  {
    id: 1,
    name: "Premium Tomato Seeds",
    slug: "premium-tomato-seeds",
    category: "Vegetables",
    price: 299,
    originalPrice: 399,
    stock: 150,
    description: "High-yield hybrid tomato seeds perfect for home gardens. These seeds produce large, juicy tomatoes with excellent flavor.",
    short_description: "High-yield hybrid tomato seeds",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300&auto=format&fit=crop",
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    status: "active",
    featured: true,
    tags: ["vegetables", "seeds", "hybrid", "tomato"],
    weight: "50g",
    dimensions: "10x5x2 cm",
    sku: "TOM-001",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T15:45:00Z",
    created_by: "admin",
    meta_title: "Premium Tomato Seeds - AgroNova",
    meta_description: "Buy premium tomato seeds for your garden. High-yield hybrid variety with excellent flavor.",
    seo_keywords: "tomato seeds, vegetable seeds, garden seeds, hybrid tomatoes"
  },
  {
    id: 2,
    name: "Organic Wheat Seeds",
    slug: "organic-wheat-seeds",
    category: "Grains",
    price: 199,
    originalPrice: 249,
    stock: 200,
    description: "Premium organic wheat seeds for sustainable farming. Certified organic and non-GMO.",
    short_description: "Certified organic wheat seeds",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=300&auto=format&fit=crop",
    rating: 4.6,
    reviews: 89,
    badge: "Organic",
    status: "active",
    featured: false,
    tags: ["grains", "organic", "wheat", "certified"],
    weight: "1kg",
    dimensions: "25x15x5 cm",
    sku: "WHT-002",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-01-18T12:20:00Z",
    created_by: "admin",
    meta_title: "Organic Wheat Seeds - AgroNova",
    meta_description: "Certified organic wheat seeds for sustainable farming. Non-GMO and premium quality.",
    seo_keywords: "wheat seeds, organic seeds, grain seeds, farming seeds"
  },
  {
    id: 3,
    name: "Hybrid Corn Seeds",
    slug: "hybrid-corn-seeds",
    category: "Grains",
    price: 399,
    originalPrice: 499,
    stock: 0,
    description: "High-yield corn seeds resistant to common diseases. Perfect for commercial farming.",
    short_description: "Disease-resistant corn seeds",
    image: "https://images.unsplash.com/photo-1520374890331-2725e9f20b78?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    reviews: 156,
    badge: "New",
    status: "out_of_stock",
    featured: true,
    tags: ["grains", "corn", "hybrid", "disease-resistant"],
    weight: "500g",
    dimensions: "20x12x4 cm",
    sku: "CRN-003",
    created_at: "2024-01-05T14:20:00Z",
    updated_at: "2024-01-22T08:30:00Z",
    created_by: "admin",
    meta_title: "Hybrid Corn Seeds - AgroNova",
    meta_description: "High-yield disease-resistant corn seeds for commercial farming. Premium quality guaranteed.",
    seo_keywords: "corn seeds, hybrid corn, farming seeds, commercial seeds"
  },
  {
    id: 4,
    name: "Premium Rice Seeds",
    slug: "premium-rice-seeds",
    category: "Grains",
    price: 249,
    originalPrice: 299,
    stock: 100,
    description: "High-quality rice seeds for optimal yield. Suitable for various climatic conditions.",
    short_description: "High-quality rice seeds",
    image: "https://images.unsplash.com/photo-1524592714635-d77511a4834a?q=80&w=300&auto=format&fit=crop",
    rating: 4.7,
    reviews: 98,
    badge: "Limited",
    status: "active",
    featured: false,
    tags: ["grains", "rice", "seeds", "high-yield"],
    weight: "750g",
    dimensions: "22x14x6 cm",
    sku: "RCE-005",
    created_at: "2024-01-12T13:30:00Z",
    updated_at: "2024-01-19T10:15:00Z",
    created_by: "admin",
    meta_title: "Premium Rice Seeds - AgroNova",
    meta_description: "High-quality rice seeds for optimal yield. Suitable for various farming conditions.",
    seo_keywords: "rice seeds, grain seeds, farming seeds, rice farming"
  },
  {
    id: 5,
    name: "Garden Spade",
    slug: "garden-spade",
    category: "Tools",
    price: 899,
    originalPrice: 1099,
    stock: 50,
    description: "Professional grade garden spade for all your digging needs. Durable steel construction.",
    short_description: "Professional grade garden spade",
    image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=300&auto=format&fit=crop",
    rating: 4.5,
    reviews: 67,
    badge: "Tool",
    status: "active",
    featured: false,
    tags: ["tools", "spade", "gardening", "steel"],
    weight: "2kg",
    dimensions: "120x25x5 cm",
    sku: "TOL-001",
    created_at: "2024-01-08T11:20:00Z",
    updated_at: "2024-01-16T14:30:00Z",
    created_by: "admin",
    meta_title: "Garden Spade - AgroNova",
    meta_description: "Professional grade garden spade for all your digging needs. Durable steel construction.",
    seo_keywords: "garden spade, gardening tools, digging tools, steel spade"
  },
  {
    id: 6,
    name: "Organic Fertilizer",
    slug: "organic-fertilizer",
    category: "Fertilizers",
    price: 599,
    originalPrice: 699,
    stock: 75,
    description: "Premium organic fertilizer enriched with natural nutrients for healthy plant growth.",
    short_description: "Premium organic fertilizer",
    image: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?q=80&w=300&auto=format&fit=crop",
    rating: 4.4,
    reviews: 45,
    badge: "Organic",
    status: "active",
    featured: false,
    tags: ["fertilizer", "organic", "nutrients", "plant-growth"],
    weight: "5kg",
    dimensions: "30x20x10 cm",
    sku: "FERT-001",
    created_at: "2024-01-14T09:45:00Z",
    updated_at: "2024-01-21T16:20:00Z",
    created_by: "admin",
    meta_title: "Organic Fertilizer - AgroNova",
    meta_description: "Premium organic fertilizer enriched with natural nutrients for healthy plant growth.",
    seo_keywords: "organic fertilizer, plant nutrients, natural fertilizer, garden fertilizer"
  },
  {
    id: 7,
    name: "Premium Mango Saplings",
    slug: "premium-mango-saplings",
    category: "Fruits",
    price: 599,
    originalPrice: 799,
    stock: 50,
    description: "Grafted mango saplings ready for planting. High-quality varieties with excellent fruit production.",
    short_description: "Grafted mango saplings",
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=300&auto=format&fit=crop",
    rating: 4.9,
    reviews: 203,
    badge: "Premium",
    status: "active",
    featured: true,
    tags: ["fruits", "mango", "saplings", "grafted"],
    weight: "2kg",
    dimensions: "30x20x15 cm",
    sku: "MNG-004",
    created_at: "2024-01-20T11:45:00Z",
    updated_at: "2024-01-25T16:10:00Z",
    created_by: "admin",
    meta_title: "Premium Mango Saplings - AgroNova",
    meta_description: "High-quality grafted mango saplings for excellent fruit production. Ready to plant.",
    seo_keywords: "mango saplings, fruit trees, grafted mango, mango plants"
  }
];

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const apiBase = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

  // Load products from backend (fallback to localStorage/default)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/products/`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log('ProductContext - Fetched products from backend:', data);
        // Ensure minimal fields for UI and map backend fields to frontend fields
        const normalized = data.map(p => ({
          originalPrice: Math.round((p.originalPrice || p.price * 1.3)),
          rating: p.rating || 4.5,
          reviews: p.reviews || Math.floor(Math.random() * 100) + 20,
          badge: p.badge || (p.featured ? 'Featured' : 'New'),
          // Map backend fields to frontend expected fields
          stock: p.stock_quantity || p.stock || 0,
          image: p.image_url || p.image || '',
          slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-'),
          short_description: p.short_description || p.description?.substring(0, 100) + '...',
          featured: p.featured || false,
          status: p.status || 'active',
          tags: p.tags || [],
          weight: p.weight || '',
          dimensions: p.dimensions || '',
          sku: p.sku || '',
          meta_title: p.meta_title || p.name,
          meta_description: p.meta_description || p.description,
          seo_keywords: p.seo_keywords || '',
          created_by: p.created_by || 'admin',
          ...p
        }));
        dispatch({ type: 'SET_PRODUCTS', payload: normalized });
        localStorage.setItem('agronova_products', JSON.stringify(normalized));
        return;
      } catch (e) {
        console.error('Product API unavailable:', e);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load products from server' });
      }

      // If API fails, show empty state instead of fallback products
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
    };
    load();
  }, [apiBase]);

  // Save products to localStorage whenever products change
  useEffect(() => {
    if (state.products.length > 0) {
      localStorage.setItem('agronova_products', JSON.stringify(state.products));
    }
  }, [state.products]);

  const addProduct = async (product) => {
    // Post to backend
    try {
      const res = await fetch(`${apiBase}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          price: Number(product.price),
          stock_quantity: Number(product.stock || 0),
          description: product.description,
          image_url: product.image,
          // Note: Backend doesn't support these fields yet, but we'll include them for future compatibility
          // slug: product.slug,
          // short_description: product.short_description,
          // status: product.status || 'active',
          // featured: Boolean(product.featured),
          // tags: typeof product.tags === 'string' ? product.tags : (product.tags || []).join(', '),
          // weight: product.weight,
          // dimensions: product.dimensions,
          // sku: product.sku,
          // meta_title: product.meta_title,
          // meta_description: product.meta_description,
          // seo_keywords: product.seo_keywords
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      const normalized = {
        originalPrice: Math.round((saved.originalPrice || saved.price * 1.3)),
        rating: saved.rating || 4.5,
        reviews: saved.reviews || Math.floor(Math.random() * 100) + 20,
        badge: saved.badge || (saved.featured ? 'Featured' : 'New'),
        ...saved
      };
      dispatch({ type: 'ADD_PRODUCT', payload: normalized });
      return { success: true, data: normalized };
    } catch (e) {
      console.error('Failed to add product via API:', e);
      // Fallback: add locally so UI keeps working offline
      const newProduct = {
        ...product,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        originalPrice: product.originalPrice || Math.round(product.price * 1.3),
        rating: product.rating || 4.5,
        reviews: product.reviews || Math.floor(Math.random() * 100) + 20,
        badge: product.badge || (product.featured ? 'Featured' : 'New')
      };
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      return { success: false, data: newProduct };
    }
  };

  const updateProduct = async (productOrId, updateData = null) => {
    // Handle both single parameter (full product) and two parameter (id + data) calls
    let productId, productData;
    
    if (updateData === null) {
      // Single parameter: full product object
      productId = productOrId.id;
      productData = productOrId;
    } else {
      // Two parameters: id + update data
      productId = productOrId;
      productData = updateData;
    }

    // Find the existing product to merge with update data
    const existingProduct = state.products.find(p => p.id === productId);
    if (!existingProduct) {
      console.error('Product not found for update:', productId);
      return { success: false, error: 'Product not found' };
    }

    const updatedProduct = {
      ...existingProduct,
      ...productData,
      updated_at: new Date().toISOString()
    };

    // Try to update via API first
    try {
      const res = await fetch(`${apiBase}/products/${productId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedProduct.name,
          category: updatedProduct.category,
          price: Number(updatedProduct.price),
          stock_quantity: Number(updatedProduct.stock || 0),
          description: updatedProduct.description,
          image_url: updatedProduct.image,
          // Note: Backend doesn't support these fields yet
          // slug: updatedProduct.slug,
          // short_description: updatedProduct.short_description,
          // status: updatedProduct.status || 'active',
          // featured: Boolean(updatedProduct.featured),
          // tags: typeof updatedProduct.tags === 'string' ? updatedProduct.tags : (updatedProduct.tags || []).join(', '),
          // weight: updatedProduct.weight,
          // dimensions: updatedProduct.dimensions,
          // sku: updatedProduct.sku,
          // meta_title: updatedProduct.meta_title,
          // meta_description: updatedProduct.meta_description,
          // seo_keywords: updatedProduct.seo_keywords
        })
      });
      
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      
      // Normalize the saved product
      const normalized = {
        originalPrice: Math.round((saved.originalPrice || saved.price * 1.3)),
        rating: saved.rating || 4.5,
        reviews: saved.reviews || Math.floor(Math.random() * 100) + 20,
        badge: saved.badge || (saved.featured ? 'Featured' : 'New'),
        ...saved
      };
      
      dispatch({ type: 'UPDATE_PRODUCT', payload: normalized });
      return { success: true, data: normalized };
    } catch (e) {
      console.error('Failed to update product via API:', e);
      // Fallback: update locally so UI keeps working offline
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      return { success: false, data: updatedProduct, error: e.message };
    }
  };

  const deleteProduct = async (productId) => {
    // Try to delete via API first
    try {
      const res = await fetch(`${apiBase}/products/${productId}/`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      return { success: true };
    } catch (e) {
      console.error('Failed to delete product via API:', e);
      // Fallback: delete locally so UI keeps working offline
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      return { success: false, error: e.message };
    }
  };

  const getActiveProducts = () => {
    return state.products.filter(product => product.status === 'active');
  };

  const getFeaturedProducts = () => {
    return state.products.filter(product => product.featured && product.status === 'active');
  };

  const getProductBySlug = (slug) => {
    return state.products.find(product => product.slug === slug);
  };

  const getProductById = (id) => {
    return state.products.find(product => product.id === id);
  };

  const getProductsByCategory = (category) => {
    return state.products.filter(product => 
      product.category === category && product.status === 'active'
    );
  };

  const searchProducts = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return state.products.filter(product => 
      product.status === 'active' && (
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )
    );
  };

  const getCategoryStats = () => {
    const activeProducts = getActiveProducts();
    const categoryMap = {};
    
    // Count products by category
    activeProducts.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category]++;
    });
    
    // Convert to array and sort by count
    return Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getUniqueCategories = () => {
    const activeProducts = getActiveProducts();
    const categories = [...new Set(activeProducts.map(product => product.category).filter(Boolean))];
    return categories.sort();
  };

  return (
    <ProductContext.Provider value={{
      products: state.products,
      activeProducts: getActiveProducts(),
      featuredProducts: getFeaturedProducts(),
      loading: state.loading,
      error: state.error,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductBySlug,
      getProductById,
      getProductsByCategory,
      searchProducts,
      getCategoryStats,
      getUniqueCategories
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
