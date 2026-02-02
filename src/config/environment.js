
/**
 * Environment Configuration Module
 */

export const getEnvironmentConfig = () => {
    const config = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        appName: import.meta.env.VITE_APP_NAME || 'Bangali Enterprise',
        appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
        appEnv: import.meta.env.VITE_APP_ENV || 'development',
        enableSupabase: import.meta.env.VITE_ENABLE_SUPABASE === 'true',
        enableRLS: import.meta.env.VITE_ENABLE_RLS === 'true'
    };

    // Validation
    if (config.enableSupabase && (!config.supabaseUrl || !config.supabaseKey)) {
        console.warn('Supabase is enabled but missing URL or Key in environment variables.');
    }

    return config;
};

export const isDevelopment = () => import.meta.env.VITE_APP_ENV === 'development';
export const isProduction = () => import.meta.env.VITE_APP_ENV === 'production';
export const isSupabaseEnabled = () => import.meta.env.VITE_ENABLE_SUPABASE === 'true';
export const isRLSEnabled = () => import.meta.env.VITE_ENABLE_RLS === 'true';
