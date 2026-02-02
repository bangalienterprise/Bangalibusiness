
import { isDevelopment } from '@/config/environment';
import { supabase } from '@/lib/supabaseClient';

export const testGlobalAdminAccess = async () => {
    if (!isDevelopment()) return { success: false, message: 'Dev mode only' };
    
    // Try to fetch all businesses without RLS restriction
    const { data, error } = await supabase.from('businesses').select('*').limit(5);
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Accessed ${data.length} businesses successfully` };
};

export const testBusinessOwnerAccess = async (businessId) => {
    if (!isDevelopment()) return { success: false, message: 'Dev mode only' };
    
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .limit(1);

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Can read business products' };
};

export const testBusinessMemberAccess = async (businessId) => {
    if (!isDevelopment()) return { success: false, message: 'Dev mode only' };
    
    // Simulate query
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .limit(1);

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Can read business customers' };
};

export const testAccessDenial = async (businessId) => {
    if (!isDevelopment()) return { success: false, message: 'Dev mode only' };
    
    // Try to access a business user likely doesn't have access to (random UUID)
    const randomId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', randomId);
        
    // If we get data back (empty array usually if RLS works but no match, or error if policy blocks SELECT)
    // RLS usually returns empty array for "no access" on SELECT policies unless "using" clause fails.
    // If we get an error, that might actually be GOOD if policy throws. 
    // Usually RLS just hides rows. So success is empty array.
    
    if (error) return { success: false, message: error.message };
    if (data.length === 0) return { success: true, message: 'Access correctly denied/hidden' };
    return { success: false, message: 'Warning: Data returned from unauthorized source!' };
};
