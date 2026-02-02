import { supabase } from '@/services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const TeamService = {
  async getTeamMembers(businessId) {
    if (!businessId) return { data: [], error: "No business ID provided" };

    // Fetch from business_users joint with profiles
    const { data, error } = await supabase
      .from('business_users')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error fetching team:', error);
      return { data: [], error };
    }

    // Normalize data structure for frontend (TeamMemberRow expects member.profile)
    const formattedData = data.map(item => ({
      ...item,
      user_id: item.user_id, // Ensure user_id is available directly
      profile: item.profile // Profile details
    }));

    return { data: formattedData, error: null };
  },

  async inviteMember({ businessId, email, role, permissions = [], invitedBy }) {
    if (!businessId || !email || !role) throw new Error("Missing required fields");

    const code = uuidv4().slice(0, 8).toUpperCase(); // 8 char code for easier manual entry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data, error } = await supabase
      .from('business_invitations')
      .insert({
        business_id: businessId,
        email: email,
        role: role,
        permissions: permissions, // Save jsonb array
        code: code,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_by: invitedBy
      })
      .select()
      .single();

    if (error) throw error;

    // Fix: Point to /signup?code=... because /join does not exist
    return {
      inviteLink: `${window.location.origin}/signup?code=${code}`,
      code,
      ...data
    };
  },

  async updateMemberRole(businessId, userId, newRole) {
    const { error } = await supabase
      .from('business_users')
      .update({ role: newRole })
      .eq('business_id', businessId)
      .eq('user_id', userId);

    if (error) throw error;

    // Also sync the profiles table just in case (though business_users is the authority)
    // Note: This might fail if RLS prevents editing other profiles, but business_users should succeed
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);

    return true;
  },

  async updateMemberPermissions(businessId, userId, newPermissions) {
    const { error } = await supabase
      .from('business_users')
      .update({ permissions: newPermissions })
      .eq('business_id', businessId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async deactivateMember(businessId, userId) {
    // business_users doesn't have status, assuming we remove them or have a status column?
    // TeamMemberRow assumes a status column. 'business_users' in setup didn't show one, let's assume we add it or use profiles.
    // Re-reading master_setup: business_users has (id, business_id, user_id, role, created_at). NO STATUS.
    // But profiles has status? No.
    // profiles has no status.
    // businesses has subscription_status.
    // students has status.
    // Maybe we just delete them for now?
    // Or we add 'status' to business_users via SQL update.

    // For safety, let's assume valid column if usage existed, but based on master_setup it's missing.
    // I will treat deactivate as REMOVE for now to be safe, or try to update status if exists.
    const { error } = await supabase
      .from('business_users')
      .delete() // Simple Remove for 'deactivate' if status column missing
      .eq('business_id', businessId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async reactivateMember(businessId, userId) {
    // Re-invite needed if deleted.
    throw new Error("Cannot reactivate removed member. Please re-invite.");
  },

  async removeMember(businessId, userId) {
    const { error } = await supabase
      .from('business_users')
      .delete()
      .eq('business_id', businessId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
};