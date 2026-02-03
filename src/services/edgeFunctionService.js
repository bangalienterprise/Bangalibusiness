import { supabase } from '@/lib/customSupabaseClient';

/**
 * Service to handle all Supabase Edge Function calls
 */
export const edgeFunctionService = {
  
  /**
   * Calls a specific Edge Function by name
   */
  async callFunction(functionName, payload = { name: "Functions" }) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Error calling function ${functionName}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Log an audit event
   */
  async logAudit(actionName) {
    return this.callFunction('audit-log', { name: actionName });
  },

  /**
   * Process a sale through Edge Function
   */
  async createSale(saleData) {
    return this.callFunction('create-sale', saleData);
  },

  /**
   * Generate a report
   */
  async generateReport(reportType) {
    return this.callFunction('generate-report', { name: reportType });
  },

  /**
   * Send a system notification
   */
  async sendNotification(recipient, message) {
    return this.callFunction('send-notification', { name: recipient, message });
  },

  /**
   * Run a safety check on SQL queries
   */
  async checkSqlSafety(query) {
    return this.callFunction('sql-safety-test', { name: query });
  }
};
