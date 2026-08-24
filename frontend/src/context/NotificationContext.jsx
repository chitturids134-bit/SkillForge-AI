import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getNotifications as apiGetNotifications,
  getUnreadCount as apiGetUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
} from '../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch full notification list
  const fetchNotifications = useCallback(async ({ limit = 20, page = 1, filter = 'all' } = {}) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetNotifications({ limit, page, filter });
      if (data && data.success) {
        setNotifications(data.notifications || []);
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('NotificationContext fetchNotifications Error:', err);
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch only unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiGetUnreadCount();
      if (data && data.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('NotificationContext fetchUnreadCount Error:', err);
    }
  }, [user]);

  // Mark single notification as read (Optimistic UI)
  const markAsRead = async (id) => {
    if (!id) return;
    const target = notifications.find(n => n._id === id || n.id === id);
    if (!target || target.isRead) return;

    // Optimistic Update
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    setNotifications(prev =>
      prev.map(n => ((n._id === id || n.id === id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await apiMarkAsRead(id);
    } catch (err) {
      console.error('NotificationContext markAsRead Error:', err);
      // Rollback on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  };

  // Mark all notifications as read (Optimistic UI)
  const markAllAsRead = async () => {
    if (unreadCount === 0 && notifications.every(n => n.isRead)) return;

    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiMarkAllAsRead();
    } catch (err) {
      console.error('NotificationContext markAllAsRead Error:', err);
      // Rollback on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  };

  // Delete notification (Optimistic UI)
  const deleteNotification = async (id) => {
    if (!id) return;
    const target = notifications.find(n => n._id === id || n.id === id);
    const wasUnread = target ? !target.isRead : false;

    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await apiDeleteNotification(id);
    } catch (err) {
      console.error('NotificationContext deleteNotification Error:', err);
      // Rollback on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  };

  // Prepend new notification in real-time
  const addNotification = (newNotif) => {
    if (!newNotif) return;
    setNotifications(prev => [newNotif, ...prev]);
    if (!newNotif.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Sync state when user logs in / logs out
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll unread count every 30 seconds for near-real-time updates
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      // Clear state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
