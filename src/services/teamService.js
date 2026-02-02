import { supabase } from '@/lib/customSupabaseClient';

export const teamService = {
    async getTeamMembers(businessId) {
        const { data, error } = await supabase
            .from('business_users')
            .select(`
        *,
        profile:profiles(
          id,
          full_name,
          email,
          role,
          commission_percentage,
          commission_type,
          commission_amount,
          is_active_commission
        )
      `)
            .eq('business_id', businessId);

        if (error) return { data: [], error };

        // Flatten the structure for easier use
        const members = data.map(bu => ({
            id: bu.profile.id,
            business_user_id: bu.id,
            full_name: bu.profile.full_name,
            email: bu.profile.email,
            role: bu.role,
            business_id: businessId,
            commission_percentage: bu.profile.commission_percentage || 0,
            commission_type: bu.profile.commission_type || 'percentage',
            commission_amount: bu.profile.commission_amount || 0,
            is_active_commission: bu.profile.is_active_commission !== false,
            joined_at: bu.created_at
        }));

        return { data: members, error: null };
    },

    async removeMember(businessUserId) {
        const { error } = await supabase
            .from('business_users')
            .delete()
            .eq('id', businessUserId);

        return { error };
    },

    async updateMemberRole(businessUserId, newRole) {
        const { data, error } = await supabase
            .from('business_users')
            .update({ role: newRole })
            .eq('id', businessUserId)
            .select()
            .single();

        return { data, error };
    }
};
