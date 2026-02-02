
/**
 * Supabase Configuration Module
 */

// Load environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
const APP_ENV = import.meta.env.VITE_APP_ENV;

// Validation
const requiredVars = [
  { name: 'VITE_SUPABASE_URL', value: SUPABASE_URL },
  { name: 'VITE_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY },
];

if (APP_ENV === 'development') {
  const missing = requiredVars.filter(v => !v.value);
  if (missing.length > 0) {
    console.warn(`[Supabase Config] Missing environment variables: ${missing.map(m => m.name).join(', ')}`);
  }
}

export const config = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  supabaseServiceKey: SUPABASE_SERVICE_KEY,
  isDev: APP_ENV === 'development'
};
