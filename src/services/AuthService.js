
import { supabase } from '@/lib/customSupabaseClient';

export const authService = {
  // Login
  async loginUser({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Fetch profile to ensure it exists and return it
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return { user: data.user, profile, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Signup (Create Account + Business)
  async signupUser({ email, password, fullName, businessType, businessName, accountType, inviteCode }) {
    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      const userId = authData.user.id;

      // 2. Create/Ensure Profile
      // We use upsert to be safe against race conditions with triggers
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: fullName,
          role: accountType === 'join' ? 'viewer' : 'owner', // Default role, will upgrade if business created
          created_at: new Date().toISOString()
        });

      if (profileError) {
          // If upsert fails (e.g. RLS), we hope the trigger worked. 
          // We'll proceed, but log it.
          console.warn("Profile upsert failed (might exist via trigger):", profileError);
      }

      // 3. Handle Business Logic
      if (accountType === 'create') {
          // A. Create Business
          const { data: business, error: bizError } = await supabase
            .from('businesses')
            .insert({
                name: businessName,
                type: businessType || 'retail',
                owner_id: userId,
                subscription_status: 'active'
            })
            .select()
            .single();

          if (bizError) throw bizError;

          // B. Link Business to Owner (Profile)
          await supabase
            .from('profiles')
            .update({ business_id: business.id, role: 'owner' })
            .eq('id', userId);

          // C. Add to Business Users (Team)
          await supabase
            .from('business_users')
            .insert({
                business_id: business.id,
                user_id: userId,
                role: 'owner'
            });

      } else if (accountType === 'join' && inviteCode) {
          // Logic for joining via invite code would go here
          // For now, we'll assume the invite system handles the linking via a separate service call
          // or we can implement a basic lookup here.
          
          // Basic Invite Logic:
          const { data: invitation } = await supabase
            .from('business_invitations')
            .select('*')
            .eq('code', inviteCode)
            .single();
            
          if (invitation) {
             await supabase
                .from('business_users')
                .insert({
                    business_id: invitation.business_id,
                    user_id: userId,
                    role: invitation.role
                });
                
             await supabase
                .from('profiles')
                .update({ business_id: invitation.business_id, role: invitation.role })
                .eq('id', userId);
          }
      }

      return { user: authData.user, error: null };

    } catch (error) {
      console.error("Signup error:", error);
      return { user: null, error };
    }
  },

  // Logout
  async logoutUser() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get Current User Data
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return { user: null, error: authError };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid 406 error if profile missing

      // Fetch business if linked
      let business = null;
      if (profile?.business_id) {
          const { data: biz } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', profile.business_id)
            .maybeSingle();
          business = biz;
      }

      return { user, profile, business, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }
};
