
import SupabaseService from './SupabaseService';
import { supabase } from './supabaseClient';

class SettingsService extends SupabaseService {
  constructor() {
    super('business_settings');
  }

  async getSettings(businessId) {
     const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('business_id', businessId)
        .single();
    
    // If no settings found, return default
    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    
    return data ? data.settings : null;
  }

  async updateSettings(businessId, settings) {
     // Check if settings exist
     const existing = await this.getSettings(businessId);
     
     if (existing) {
         // Update
         const { data, error } = await supabase
            .from('business_settings')
            .update({ settings })
            .eq('business_id', businessId)
            .select()
            .single();
         if (error) throw error;
         return data;
     } else {
         // Create
         const { data, error } = await supabase
            .from('business_settings')
            .insert({ business_id: businessId, settings })
            .select()
            .single();
         if (error) throw error;
         return data;
     }
  }

  async resetSettings(businessId) {
      // Deleting the record will allow it to regenerate defaults next time or explicitly set defaults here
      const { error } = await supabase
        .from('business_settings')
        .delete()
        .eq('business_id', businessId);
      if (error) throw error;
      return true;
  }
}

export const settingsService = new SettingsService();
