
import { supabase } from '@/lib/customSupabaseClient';

export const notificationService = {
  async getNotifications(userId, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    return { error };
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    return { error };
  },

  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    return { error };
  }
};
