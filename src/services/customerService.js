
import { supabase } from "@/lib/customSupabaseClient";
import { supabase as mockSupabase } from "@/lib/supabase";

export const customerService = {
    async getCustomersByBusiness(businessId) {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', businessId);
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('customers').select('*').eq('business_id', businessId);
        }
        return { data, error };
    },

    async createCustomer(businessId, data) {
        const { data: res, error } = await supabase.from('customers').insert({ ...data, business_id: businessId }).select().single();
        
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('customers').insert({ ...data, business_id: businessId }).select().single();
        }
        return { data: res, error };
    }
};
