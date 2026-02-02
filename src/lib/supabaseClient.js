
import { customSupabaseClient } from './customSupabaseClient';

// Re-export the singleton instance to ensure consistency across the app
export const supabase = customSupabaseClient;

// Export auth helper
export const auth = customSupabaseClient.auth;

// Export database helper (alias for supabase client in this context)
export const database = customSupabaseClient;

// Admin client placeholder - strictly frontend environment should not use service role key
// If needed for specific edge cases, it should be handled via Edge Functions
export const supabaseAdmin = null; 

export default customSupabaseClient;
