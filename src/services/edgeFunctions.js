
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Logs an action to the audit log via Edge Function
 * @param {string} action - The action name (e.g., 'CREATE_SALE', 'LOGIN')
 * @param {string} entityType - The type of entity involved (e.g., 'sales_transactions')
 * @param {string} entityId - The ID of the entity
 * @param {object} metadata - Additional details about the action
 */
export const logAuditEvent = async (action, entityType, entityId, metadata = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase.functions.invoke('audit-log', {
      body: {
        action,
        actor_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return { error: error.message };
  }
};

/**
 * Sends a notification to a user via Edge Function
 * @param {string} userId - The recipient user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} type - 'info', 'success', 'warning', 'error'
 */
export const sendNotification = async (userId, title, message, type = 'info') => {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: { user_id: userId, title, message, type }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { error: error.message };
  }
};

/**
 * Generates a report via Edge Function
 * @param {string} businessId - The business ID
 * @param {string} reportType - 'sales', 'inventory', 'customer', 'expense'
 * @param {object} dateRange - { startDate, endDate }
 */
export const generateReport = async (businessId, reportType, dateRange) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { business_id: businessId, report_type: reportType, date_range: dateRange }
    });

    if (error) throw error;
    return { success: true, report: data };
  } catch (error) {
    console.error('Failed to generate report:', error);
    return { error: error.message };
  }
};
