
import { supabase } from '@/lib/supabaseClient';

/**
 * Check if current user is a global admin
 */
export const checkIsGlobalAdmin = async () => {
    try {
        // This relies on a specific RPC or checking the profiles table directly
        // Assuming 'profiles' table has an 'is_super_admin' or 'role' column
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data?.role === 'super_admin';
    } catch (error) {
        console.error('Error checking global admin:', error);
        return false;
    }
};

/**
 * Check if user has access to a specific business
 */
export const checkUserBusinessAccess = async (businessId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Check if user is linked to business in profiles or separate business_users table
        // Implementation depends on schema. Assuming 'profiles' links to 'business_id' for simplicity
        // OR checking a join table.
        
        // Option 1: Profile link
        const { data, error } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', user.id)
            .single();
            
        if (error) throw error;
        
        // Check if user's business_id matches or if they have access via other means
        if (data.business_id === businessId) return true;

        // Check for super admin override
        const isGlobal = await checkIsGlobalAdmin();
        return isGlobal;

    } catch (error) {
        console.error('Error checking business access:', error);
        return false;
    }
};

/**
 * Check if user can edit a product
 */
export const checkUserCanEditProduct = async (businessId, productId) => {
    // Basic logic: Must have access to business.
    // Granular permissions (like role='manager') would be checked here.
    return checkUserBusinessAccess(businessId);
};

/**
 * Check if user can delete a product
 */
export const checkUserCanDeleteProduct = async (businessId, productId) => {
    // Basic logic: Must have access to business.
    return checkUserBusinessAccess(businessId);
};
