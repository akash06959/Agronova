import { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

// Wishlist reducer
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      const exists = state.items.find(item => item.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: []
      };

    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload || []
      };

    default:
      return state;
  }
};

// Combined reducer
const combinedReducer = (state, action) => {
  if (action.type.startsWith('CART_')) {
    return {
      ...state,
      cart: cartReducer(state.cart, { ...action, type: action.type.replace('CART_', '') })
    };
  }
  if (action.type.startsWith('WISHLIST_')) {
    return {
      ...state,
      wishlist: wishlistReducer(state.wishlist, { ...action, type: action.type.replace('WISHLIST_', '') })
    };
  }
  return state;
};

const initialState = {
  cart: { items: [] },
  wishlist: { items: [] }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(combinedReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('agronova_cart');
      const savedWishlist = localStorage.getItem('agronova_wishlist');
      
      if (savedCart && savedCart !== '[]') {
        const cartData = JSON.parse(savedCart);
        if (Array.isArray(cartData) && cartData.length > 0) {
          dispatch({ type: 'CART_LOAD_CART', payload: cartData });
        }
      }
      if (savedWishlist && savedWishlist !== '[]') {
        const wishlistData = JSON.parse(savedWishlist);
        if (Array.isArray(wishlistData) && wishlistData.length > 0) {
          dispatch({ type: 'WISHLIST_LOAD_WISHLIST', payload: wishlistData });
        }
      }
    } catch (error) {
      console.error('Error loading cart/wishlist from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('agronova_cart', JSON.stringify(state.cart.items));
  }, [state.cart.items]);

  useEffect(() => {
    localStorage.setItem('agronova_wishlist', JSON.stringify(state.wishlist.items));
  }, [state.wishlist.items]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'CART_ADD_TO_CART', payload: { ...product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'CART_REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'CART_UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CART_CLEAR_CART' });
  };

  // Wishlist actions
  const addToWishlist = (product) => {
    dispatch({ type: 'WISHLIST_ADD_TO_WISHLIST', payload: product });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: 'WISHLIST_REMOVE_FROM_WISHLIST', payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: 'WISHLIST_CLEAR_WISHLIST' });
  };

  // Helper functions
  const isInCart = (productId) => {
    return state.cart.items.some(item => item.id === productId);
  };

  const isInWishlist = (productId) => {
    return state.wishlist.items.some(item => item.id === productId);
  };

  const getCartItemQuantity = (productId) => {
    const item = state.cart.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getCartTotal = () => {
    return state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return state.wishlist.items.length;
  };

  const value = {
    // State
    cart: state.cart,
    wishlist: state.wishlist,
    
    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Wishlist actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    
    // Helper functions
    isInCart,
    isInWishlist,
    getCartItemQuantity,
    getCartTotal,
    getCartItemsCount,
    getWishlistCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
