import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const AdminAuthContext = createContext();

const adminAuthReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        admin: action.payload,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        admin: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        admin: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  admin: null,
  loading: true, // Start with loading true to prevent immediate redirect
  error: null
};

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Load admin from localStorage on mount
  useEffect(() => {
    const loadAdmin = () => {
      try {
        const savedAdmin = localStorage.getItem('agronova_admin');
        if (savedAdmin) {
          const admin = JSON.parse(savedAdmin);
          // Validate admin object has required fields
          if (admin && admin.username && admin.id) {
            console.log('Admin loaded from localStorage:', admin.username);
            dispatch({ type: 'LOGIN_SUCCESS', payload: admin });
          } else {
            console.warn('Invalid admin data in localStorage, clearing...');
            localStorage.removeItem('agronova_admin');
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid admin data' });
          }
        } else {
          // No admin data found, set loading to false
          dispatch({ type: 'LOGIN_FAILURE', payload: 'No admin data' });
        }
      } catch (error) {
        console.error('Error loading admin from localStorage:', error);
        localStorage.removeItem('agronova_admin');
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Error loading admin data' });
      }
    };
    
    loadAdmin();
  }, []);

  // Save admin to localStorage when state changes
  useEffect(() => {
    if (state.admin) {
      try {
        localStorage.setItem('agronova_admin', JSON.stringify(state.admin));
        console.log('Admin saved to localStorage:', state.admin.username);
      } catch (error) {
        console.error('Error saving admin to localStorage:', error);
      }
    } else {
      // Only remove from localStorage if explicitly logged out
      if (state.admin === null) {
        localStorage.removeItem('agronova_admin');
        console.log('Admin removed from localStorage');
      }
    }
  }, [state.admin]);

  // Session timeout mechanism (2 hours)
  useEffect(() => {
    if (!state.admin) return;

    const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
    const WARNING_TIME = 1.5 * 60 * 60 * 1000; // 1.5 hours (30 min warning)
    
    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity > SESSION_TIMEOUT) {
        console.log('Admin session expired, logging out...', {
          timeSinceActivity: Math.round(timeSinceActivity / 60000) + ' minutes',
          lastActivity: new Date(lastActivity).toISOString(),
          now: new Date(now).toISOString()
        });
        dispatch({ type: 'LOGOUT' });
      } else if (timeSinceActivity > WARNING_TIME) {
        console.warn('Admin session will expire in 30 minutes. Please refresh the page to continue.');
        // You could show a notification here
      }
    };

    const interval = setInterval(checkSession, 5 * 60000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [state.admin, lastActivity]);

  // Update last activity on user interaction
  useEffect(() => {
    if (!state.admin) return;

    const updateActivity = () => {
      const now = Date.now();
      setLastActivity(now);
      console.log('Admin activity detected:', new Date(now).toISOString());
    };
    
    // Listen for user activity
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [state.admin]);

  const login = async (username, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock admin data - replace with actual API response
      // For demo purposes, accept admin/admin as credentials
      if (username === 'admin' && password === 'admin') {
        const admin = {
          id: 1,
          username: 'admin',
          email: 'admin@agronova.com',
          role: 'super_admin',
          permissions: ['products', 'users', 'analytics', 'orders'],
          createdAt: new Date().toISOString()
        };
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: admin });
        return { success: true };
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid admin credentials' });
        return { success: false, error: 'Invalid admin credentials' };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    console.log('Admin logging out...', new Date().toISOString());
    console.trace('Logout called from:');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshSession = () => {
    if (state.admin) {
      setLastActivity(Date.now());
      console.log('Admin session refreshed');
    }
  };

  const value = {
    admin: state.admin,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    clearError,
    refreshSession
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
