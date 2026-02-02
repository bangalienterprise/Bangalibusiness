
import { supabase } from '@/lib/supabaseClient';

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

/**
 * Get the current session
 */
export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
};

/**
 * Sign up a new user
 */
export const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
    });
    return { user: data.user, session: data.session, error };
};

/**
 * Sign in an existing user
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
    });
    return { user: data.user, session: data.session, error };
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

/**
 * Send a password reset email
 */
export const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
};

/**
 * Update the current user's password
 */
export const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
    });
    return { user: data.user, error };
};

/**
 * Update the current user's email
 */
export const updateEmail = async (newEmail) => {
    const { data, error } = await supabase.auth.updateUser({ 
        email: newEmail 
    });
    return { user: data.user, error };
};
