import { apiClient } from '@/services/apiClient';
import { ROLES } from '@/lib/roles';

export const NotificationService = {
  async fetchNotifications(businessId, userId, role, limit = 10, offset = 0) {
    if (!userId) return { data: [], count: 0 };

    // In a real API we would filter by role on the backend
    // Here we just fetch user notifications
    const { data, success } = await apiClient.get('/notifications', { 
        params: { user_id: userId },
        limit
    });
    
    if (!success) throw new Error("Failed to fetch notifications");
    return { data: data || [], count: data?.length || 0 };
  },

  async createNotification(notification) {
      await apiClient.post('/notifications', notification);
  },

  async markAsRead(notificationId) {
     await apiClient.put(`/notifications/${notificationId}`, { is_read: true });
  },
  
  async deleteNotification(notificationId) {
      await apiClient.delete(`/notifications/${notificationId}`);
  },

  async markAllAsRead(businessId, userId) {
      // Mock bulk update
      return true;
  }
};