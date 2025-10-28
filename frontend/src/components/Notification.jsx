import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useNotification } from "../contexts/NotificationContext";

const Notification = () => {
  const { notification, hideNotification } = useNotification();
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'cart':
        return '🛒';
      case 'wishlist':
        return '❤️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'cart':
        return 'bg-green-500';
      case 'wishlist':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div className={`${getColor(notification.type)} text-white rounded-lg shadow-lg p-4 flex items-center gap-3`}>
          <div className="text-2xl">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">
              {notification.title}
            </h4>
            <p className="text-xs opacity-90">
              {notification.message}
            </p>
          </div>
          <button
            onClick={hideNotification}
            className="text-white/80 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;
