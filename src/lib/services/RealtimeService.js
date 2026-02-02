// Mock implementation of RealtimeService
export const RealtimeService = {
  subscribeToTable: (table, businessId, callback) => {
    // console.log(`[MockRealtime] Subscribed to ${table} for business ${businessId}`);
    return { unsubscribe: () => {} };
  },

  subscribeToUserNotifications: (userId, callback) => {
     // console.log(`[MockRealtime] Subscribed to notifications for user ${userId}`);
     return { unsubscribe: () => {} };
  }
};