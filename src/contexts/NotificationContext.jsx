import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();

  const fetchNotifications = async () => {
      if(!user) return;
      
      const { data } = await mockDatabase.select('notifications');
      // Filter manually since mock DB filters are basic
      const userNotifs = data.filter(n => n.user_id === user.id);
      setNotifications(userNotifs);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const addNotification = async (type, title, message, severity = 'info') => {
    if (!user) return;
    
    const newNotif = {
        user_id: user.id,
        business_id: user.user_metadata?.business_id, 
        type,
        title,
        message,
        severity,
        is_read: false
    };

    await mockDatabase.insert('notifications', newNotif);
    fetchNotifications();
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await mockDatabase.update('notifications', id, { is_read: true });
  };

  const removeNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await mockDatabase.delete('notifications', id);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};