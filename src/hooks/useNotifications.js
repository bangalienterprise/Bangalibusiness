
import React, { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/lib/services/NotificationService';

export const useNotifications = (businessId, userId, role) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, count } = await NotificationService.fetchNotifications(businessId, userId, role);
      setNotifications(data);
      setUnreadCount(count); // Simplified
    } finally {
      setLoading(false);
    }
  }, [businessId, userId, role]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await NotificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await NotificationService.markAllAsRead(businessId, userId);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
