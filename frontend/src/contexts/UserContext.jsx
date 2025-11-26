import { createContext, useContext, useReducer, useEffect } from 'react';

const UserContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
        loading: false
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
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
  users: [],
  loading: true,
  error: null
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const apiBase = import.meta.env.VITE_API_BASE || 'https://agronova-ml0a.onrender.com';

  // Load users from backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${apiBase}/users/`);
        if (!res.ok) {
          if (res.status === 500) {
            // Server error - show empty state with message
            dispatch({ type: 'SET_USERS', payload: [] });
            dispatch({ type: 'SET_ERROR', payload: 'Server error - no users available' });
            return;
          }
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        dispatch({ type: 'SET_USERS', payload: data });
      } catch (e) {
        console.error('Failed to load users:', e);
        // Show empty state instead of error
        dispatch({ type: 'SET_USERS', payload: [] });
        dispatch({ type: 'SET_ERROR', payload: 'No users found. Register some users first!' });
      }
    };
    loadUsers();
  }, [apiBase]);

  const deleteUser = async (userId) => {
    try {
      const res = await fetch(`${apiBase}/users/${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete user');
      dispatch({ type: 'DELETE_USER', payload: userId });
      return { success: true };
    } catch (e) {
      console.error('Failed to delete user:', e);
      return { success: false, error: e.message };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  return (
    <UserContext.Provider value={{
      users: state.users,
      loading: state.loading,
      error: state.error,
      deleteUser,
      formatDate,
      getTimeAgo
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
