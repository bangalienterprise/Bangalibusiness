import { supabase } from '@/lib/customSupabaseClient';

export const commissionService = {
    async getCommissionsByBusiness(businessId) {
        const { data, error } = await supabase
            .from('commissions')
            .select(`
        *,
        user:profiles(id, full_name, email),
        sale:sales_transactions(id, total_amount, created_at)
      `)
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

        return { data, error };
    },

    async getCommissionsByUser(userId, businessId) {
        const { data, error } = await supabase
            .from('commissions')
            .select(`
        *,
        sale:sales_transactions(id, total_amount, created_at)
      `)
            .eq('user_id', userId)
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

        return { data, error };
    },

    async createCommission(businessId, commissionData) {
        const { data, error } = await supabase
            .from('commissions')
            .insert({
                ...commissionData,
                business_id: businessId
            })
            .select()
            .single();

        return { data, error };
    },

    async updateUserCommission(userId, businessId, commissionSettings) {
        // Update user's commission settings in profiles table
        const { data, error } = await supabase
            .from('profiles')
            .update({
                commission_rate: commissionSettings.commission_rate,
                commission_type: commissionSettings.commission_type
            })
            .eq('id', userId)
            .eq('business_id', businessId)
            .select()
            .single();

        return { data, error };
    },

    async getUserCommissionSettings(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('commission_rate, commission_type')
            .eq('id', userId)
            .single();

        return { data, error };
    },

    async calculateCommission(saleAmount, commissionRate, commissionType = 'percentage') {
        if (commissionType === 'percentage') {
            return (saleAmount * commissionRate) / 100;
        } else {
            return commissionRate; // Fixed amount
        }
    }
};
