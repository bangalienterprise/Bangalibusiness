
import { supabase } from '@/lib/customSupabaseClient';

export const userService = {
  async getAllUsers(currentUserRole) {
    let query = supabase.from('profiles').select('*, businesses(name)');
    
    // If not global admin, RLS usually handles filtering, but we can be explicit
    // if (currentUserRole !== 'global_admin') { ... } 
    
    const { data, error } = await query;
    return { data, error };
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, businesses(name)')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async assignUserToBusinessWithRole(userId, businessId, role) {
    // Assuming profiles table has business_id and role columns as per schema
    const { data, error } = await supabase
      .from('profiles')
      .update({ business_id: businessId, role: role })
      .eq('id', userId);
    return { data, error };
  },

  async removeUserFromBusiness(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ business_id: null, role: 'viewer' }) // Default role
      .eq('id', userId);
    return { data, error };
  }
};
