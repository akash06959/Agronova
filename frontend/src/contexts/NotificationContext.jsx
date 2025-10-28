import { createContext, useContext, useReducer } from 'react';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notification: action.payload
      };
    case 'HIDE_NOTIFICATION':
      return {
        ...state,
        notification: null
      };
    default:
      return state;
  }
};

const initialState = {
  notification: null
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const showNotification = (type, title, message) => {
    dispatch({
      type: 'SHOW_NOTIFICATION',
      payload: { type, title, message }
    });
  };

  const hideNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  const showCartNotification = (productName) => {
    showNotification('cart', 'Added to Cart', `${productName} has been added to your cart`);
  };

  const showWishlistNotification = (productName) => {
    showNotification('wishlist', 'Added to Wishlist', `${productName} has been added to your wishlist`);
  };

  const showSuccessNotification = (title, message) => {
    showNotification('success', title, message);
  };

  const showErrorNotification = (title, message) => {
    showNotification('error', title, message);
  };

  const value = {
    notification: state.notification,
    showNotification,
    hideNotification,
    showCartNotification,
    showWishlistNotification,
    showSuccessNotification,
    showErrorNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
