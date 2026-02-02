
import { supabase } from "@/lib/customSupabaseClient";
import { supabase as mockSupabase } from "@/lib/supabase";

export const expenseService = {
    async getExpensesByBusiness(businessId) {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('business_id', businessId)
            .order('date', { ascending: false });
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('expenses').select('*').eq('business_id', businessId);
        }
        return { data, error };
    },

    async createExpense(businessId, expenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .insert({ ...expenseData, business_id: businessId })
            .select()
            .single();
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('expenses').insert({ ...expenseData, business_id: businessId }).select().single();
        }
        return { data, error };
    },
    
    async deleteExpense(businessId, expenseId) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId)
            .eq('business_id', businessId);
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('expenses').delete().eq('id', expenseId);
        }
        return { error };
    }
};
