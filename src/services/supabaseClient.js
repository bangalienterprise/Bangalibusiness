
import { customSupabaseClient } from '@/lib/customSupabaseClient';

// Re-export the singleton instance to ensure consistency across the app
export const supabase = customSupabaseClient;

// Helper to check connection and auth state
export const checkConnection = async () => {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) return false;
    
    // Simple query to check DB connectivity
    const { error } = await supabase.from('business_types').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
};

export default customSupabaseClient;
