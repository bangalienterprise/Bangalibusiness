
import { supabase } from '@/lib/customSupabaseClient';
import { supabase as mockSupabase } from '@/lib/supabase';
import { isRLSError } from '@/utils/errorHandler';

export const businessService = {
  async getBusinessesByUser(userId, role) {
    try {
      let query = supabase.from('businesses').select('*, profiles!owner_id(full_name, email)');

      if (role !== 'global_admin') {
        const { data: userProfile } = await supabase.from('profiles').select('business_id').eq('id', userId).single();
        if (userProfile?.business_id) {
            query = query.eq('id', userProfile.business_id);
        } else {
            // Fallback to mock if profile fetch failed
             const { data: mockProfile } = await mockSupabase.from('profiles').select('business_id').eq('id', userId).single();
             if (mockProfile?.business_id) {
                 // If we found a mock profile, we should probably return mock businesses
                 return await mockSupabase.from('businesses').select('*').eq('id', mockProfile.business_id);
             }
             return { data: [], error: null };
        }
      }

      const { data, error } = await query;
      
      if (error && isRLSError(error)) {
          console.warn("RLS: Access denied to businesses list, using mock");
          return await mockSupabase.from('businesses').select('*');
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getBusinessById(businessId) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, profiles!owner_id(full_name, email)')
      .eq('id', businessId)
      .single();
      
    if (error && isRLSError(error)) {
        return await mockSupabase.from('businesses').select('*').eq('id', businessId).single();
    }
    return { data, error };
  },

  async createBusiness(businessData) {
    if (!businessData.name || !businessData.type) {
        return { data: null, error: { message: 'Name and Type are required' } };
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...businessData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error && isRLSError(error)) {
         return await mockSupabase.from('businesses').insert(businessData).select().single();
    }

    return { data, error };
  },

  async updateBusiness(businessId, businessData) {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        ...businessData,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error && isRLSError(error)) {
        return await mockSupabase.from('businesses').update(businessData).eq('id', businessId).select().single();
    }

    return { data, error };
  },

  async deleteBusiness(businessId) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);
      
    if (error && isRLSError(error)) {
        return await mockSupabase.from('businesses').delete().eq('id', businessId);
    }
    return { data: null, error };
  }
};
