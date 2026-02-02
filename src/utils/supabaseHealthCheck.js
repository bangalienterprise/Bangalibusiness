
import { supabase } from '@/lib/supabaseClient';

export const supabaseHealthCheck = {
  async checkSupabaseConnection() {
    try {
      const start = performance.now();
      const { data, error } = await supabase.from('businesses').select('count', { count: 'exact', head: true });
      const duration = performance.now() - start;
      
      if (error) throw error;
      return { 
        success: true, 
        message: `Connected successfully in ${Math.round(duration)}ms`,
        latency: Math.round(duration)
      };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  },

  async getDatabaseMetadata() {
    try {
      const { data, error } = await supabase.rpc('get_database_health');
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Health RPC Check Failed:", error);
      return { success: false, message: error.message };
    }
  },

  async checkAllTables() {
    const requiredTables = [
      'businesses', 'profiles', 'products', 'sales', 'sale_items', 
      'customers', 'suppliers', 'expenses', 'orders', 
      'business_users', 'categories', 'audit_logs', 'system_settings'
    ];
    
    const { success, data } = await this.getDatabaseMetadata();
    
    if (success && data.tables) {
      const existingTables = data.tables.map(t => t.name);
      const missing = requiredTables.filter(t => !existingTables.includes(t));
      
      return {
        success: missing.length === 0,
        message: missing.length === 0 ? 'All required tables exist' : `Missing tables: ${missing.join(', ')}`,
        details: { required: requiredTables.length, found: existingTables.length, missing }
      };
    }

    // Fallback if RPC fails: check one by one (slower)
    const missing = [];
    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code === '42P01') missing.push(table);
    }
    
    return {
      success: missing.length === 0,
      message: missing.length === 0 ? 'All required tables verified' : `Missing tables: ${missing.join(', ')}`,
      details: { missing }
    };
  },

  async checkRLSPolicies() {
    const { success, data } = await this.getDatabaseMetadata();
    if (success && data.policies) {
      const policyCount = data.policies.length;
      return {
        success: policyCount > 0,
        message: `${policyCount} RLS policies active`,
        details: data.policies
      };
    }
    return { success: false, message: 'Could not verify RLS policies (RPC failed)' };
  },

  async checkForeignKeys() {
    const { success, data } = await this.getDatabaseMetadata();
    if (success && data.foreign_keys) {
      const fkCount = data.foreign_keys.length;
      return {
        success: fkCount > 0,
        message: `${fkCount} Foreign Keys verified`,
        details: data.foreign_keys
      };
    }
    return { success: false, message: 'Could not verify Foreign Keys (RPC failed)' };
  },

  async checkIndexes() {
    const { success, data } = await this.getDatabaseMetadata();
    if (success && data.indexes) {
      const idxCount = data.indexes.length;
      return {
        success: idxCount > 0,
        message: `${idxCount} Indexes verified`,
        details: data.indexes
      };
    }
    return { success: false, message: 'Could not verify Indexes (RPC failed)' };
  },

  async runFullHealthCheck() {
    const connection = await this.checkSupabaseConnection();
    // Optimization: fetch metadata once
    const metadata = await this.getDatabaseMetadata();
    
    // Pass metadata to functions if refactored, but for now we call them individually 
    // knowing they might fetch again or we assume checking individually is safer for detailed status.
    // Actually, let's just run them sequentially.
    
    const tables = await this.checkAllTables();
    const rls = await this.checkRLSPolicies();
    const fks = await this.checkForeignKeys();
    const indexes = await this.checkIndexes();

    return {
      success: connection.success && tables.success,
      timestamp: new Date().toISOString(),
      results: {
        connection,
        tables,
        rls,
        foreignKeys: fks,
        indexes
      }
    };
  }
};
