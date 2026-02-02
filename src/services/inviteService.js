
import { supabase } from '@/lib/customSupabaseClient';

export const inviteService = {
  /**
   * Generates a unique invite code for a business role
   */
  async generateInviteCode(businessId, role) {
    try {
      // Generate a random 8-character code (uppercase alphanumeric)
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('invites')
        .insert({
          business_id: businessId,
          code,
          role,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
        })
        .select()
        .single();

      if (error) throw error;
      return { code: data.code, data, error: null };
    } catch (error) {
      console.error('Error generating invite:', error);
      return { code: null, error };
    }
  },

  /**
   * Validates an invite code
   */
  async validateInviteCode(code) {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          businesses (name, type)
        `)
        .eq('code', code)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) throw new Error('Invalid or expired invite code');

      return { 
        valid: true, 
        business: data.businesses, 
        role: data.role,
        inviteId: data.id,
        businessId: data.business_id,
        error: null 
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Accepts an invite code and links user to business
   */
  async acceptInviteCode(code, userId) {
    try {
      // 1. Validate again
      const { valid, inviteId, businessId, role, error: valError } = await this.validateInviteCode(code);
      if (!valid) throw new Error(valError);

      // 2. Create business_user link
      const { error: linkError } = await supabase
        .from('business_users')
        .insert({
          business_id: businessId,
          user_id: userId,
          role: role
        });

      if (linkError) throw linkError;

      // 3. Mark invite as accepted
      const { error: updateError } = await supabase
        .from('invites')
        .update({ 
          status: 'accepted',
          accepted_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (updateError) console.error('Failed to mark invite accepted:', updateError);

      // 4. Update profile with default business
      await supabase
        .from('profiles')
        .update({ 
          business_id: businessId,
          role: role
        })
        .eq('id', userId);

      return { success: true, businessId, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
};
