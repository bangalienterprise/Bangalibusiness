
import { supabase } from '@/lib/supabaseClient';

export const setupTest = {
  async testSupabaseConnection() {
    try {
      const { data, error } = await supabase.from('businesses').select('count').limit(1);
      if (error) throw error;
      return { success: true, message: 'Connected to Supabase successfully' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  },

  async testDatabaseTables() {
    const tables = ['businesses', 'profiles', 'products', 'sales', 'business_users'];
    const missing = [];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code === '42P01') missing.push(table);
    }

    if (missing.length > 0) {
      return { success: false, message: `Missing tables: ${missing.join(', ')}` };
    }
    return { success: true, message: 'Critical tables exist' };
  },

  async testAccounts() {
    // We cannot query auth.users, so we check profiles for expected emails
    const expectedEmails = [
      'admin@bangalienterprise.com',
      'enterprisebangali@gmail.com',
      'arifhossenrakib001@gmail.com',
      'mrak@virgilian.com'
    ];
    
    const { data: profiles } = await supabase.from('profiles').select('email').in('email', expectedEmails);
    const foundEmails = profiles?.map(p => p.email) || [];
    
    const missing = expectedEmails.filter(e => !foundEmails.includes(e));
    
    if (missing.length > 0) {
      return { success: false, message: `Missing profiles for: ${missing.join(', ')}` };
    }
    return { success: true, message: 'All demo accounts verified in profiles' };
  },

  async runAllTests() {
    const conn = await this.testSupabaseConnection();
    if (!conn.success) return [conn];

    const tables = await this.testDatabaseTables();
    const accounts = await this.testAccounts();
    
    return [conn, tables, accounts];
  }
};
