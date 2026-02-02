
import { supabase } from '@/lib/supabaseClient';

/**
 * Service to handle database initialization and verification
 */
export const databaseInitService = {
  /**
   * Checks if required tables exist
   */
  async initializeDatabase() {
    try {
      console.log('Initializing database check...');
      
      const tablesToCheck = [
        'businesses', 'profiles', 'business_users', 'products', 'sales', 
        'customers', 'audit_logs', 'business_settings'
      ];

      const missingTables = [];

      for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('id').limit(1);
        // code 42P01 means undefined_table
        if (error && error.code === '42P01') {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        return { 
          success: false, 
          message: `Missing tables: ${missingTables.join(', ')}. Please run migrations.` 
        };
      }

      return { success: true, message: 'Database structure verified.' };
    } catch (error) {
      console.error('Database init error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Placeholder for table creation - in this environment, handled by migrations
   */
  async createTablesIfNotExist() {
    // In a real backend env, we might run DDL here.
    // For this setup, we return true as we use the AI's database tool.
    return this.initializeDatabase();
  },

  async createIndexes() {
    // Indexes are created via migration SQL
    return { success: true, message: 'Indexes managed via migrations.' };
  },

  async enableRLS() {
    // RLS enabled via migration SQL
    return { success: true, message: 'RLS policies managed via migrations.' };
  },

  async createRLSPolicies() {
    // Policies created via migration SQL
    return { success: true, message: 'RLS policies managed via migrations.' };
  }
};
