import { supabase } from '@/lib/supabase';
import { mockDatabase } from '@/lib/services/MockDatabase';

// Helper to handle Supabase responses
const handleResponse = async (promise) => {
  try {
      const { data, error } = await promise;
      if (error) {
        console.error('[API Error]:', error);
        throw error;
      }
      return { data };
  } catch (err) {
      console.error('[API Exception]:', err);
      throw err;
  }
};

// Generic API methods that route through Supabase client (which is mocked if needed)
export const api = {
    get: async (table, query = {}) => {
        let builder = supabase.from(table).select('*');
        if (query.id) builder = builder.eq('id', query.id).single();
        if (query.business_id) builder = builder.eq('business_id', query.business_id);
        // Add more query params mapping as needed
        return handleResponse(builder);
    },
    
    post: async (table, data) => {
        return handleResponse(supabase.from(table).insert(data).select().single());
    },
    
    put: async (table, id, data) => {
        return handleResponse(supabase.from(table).update(data).eq('id', id).select().single());
    },
    
    delete: async (table, id) => {
        return handleResponse(supabase.from(table).delete().eq('id', id));
    }
};

// Legacy support for specific calls if any components rely on direct fetch emulation
export const get = (endpoint) => console.warn('Legacy get called', endpoint);
export const post = (endpoint) => console.warn('Legacy post called', endpoint);

export const apiClient = api;
export default api;