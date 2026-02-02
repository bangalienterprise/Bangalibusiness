
import { supabase } from "@/lib/customSupabaseClient";
import { handleSupabaseError } from "@/utils/errorHandler";

export const adminService = {
    // Note: Creating a global admin user via Supabase Auth usually requires service role or
    // specialized edge function. Frontend-only creation is limited to public signup flows unless
    // using a specific invite logic. We will assume standard signup + manual DB update for now
    // or rely on existing auth flows.
    
    async getAdminProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .eq('role', 'global_admin')
                .single();
            
            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            return { profile: null, error: handleSupabaseError(error) };
        }
    },

    async updateAdminProfile(userId, profileData) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            return { profile: null, error: handleSupabaseError(error) };
        }
    },

    async getAllBusinesses() {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*, owner:profiles!owner_id(full_name, email)');
            
            if (error) throw error;
            return { businesses: data, error: null };
        } catch (error) {
            return { businesses: [], error: handleSupabaseError(error) };
        }
    },

    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    business:businesses(name)
                `);
            
            if (error) throw error;
            return { users: data, error: null };
        } catch (error) {
            return { users: [], error: handleSupabaseError(error) };
        }
    },

    async getSystemStats() {
        try {
            // Parallel fetch for basic counts
            const [businesses, users, products] = await Promise.all([
                supabase.from('businesses').select('id', { count: 'exact', head: true }),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('products').select('id', { count: 'exact', head: true })
            ]);

            // Revenue calculation (mock or real if table exists)
            // Assuming sales_transactions table for revenue
            const { data: revenueData } = await supabase
                .from('sales_transactions')
                .select('total_amount');
            
            const totalRevenue = revenueData?.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0) || 0;

            return {
                stats: {
                    totalBusinesses: businesses.count || 0,
                    totalUsers: users.count || 0,
                    totalProducts: products.count || 0,
                    totalRevenue
                },
                error: null
            };
        } catch (error) {
            return { stats: null, error: handleSupabaseError(error) };
        }
    },

    async getAuditLogs(limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (error) throw error;
            return { logs: data, error: null };
        } catch (error) {
            return { logs: [], error: handleSupabaseError(error) };
        }
    },

    async getBackups() {
        try {
            const { data, error } = await supabase
                .from('backups')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { backups: data, error: null };
        } catch (error) {
            return { backups: [], error: handleSupabaseError(error) };
        }
    }
};
