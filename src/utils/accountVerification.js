
import { supabaseAdmin } from '@/lib/supabaseClient';

export const accountVerification = {
  async verifyUserByEmail(email, expectedRole) {
    if (!supabaseAdmin) {
      return { success: false, email, message: 'Admin client not available (missing service key)' };
    }

    try {
      // 1. Check Auth User
      const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) throw authError;

      const user = users.find(u => u.email === email);
      
      if (!user) {
        return { success: false, email, message: 'User not found in Auth' };
      }

      // 2. Check Profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return { success: false, email, message: 'User exists in Auth but missing Profile' };
      }

      // 3. Verify Role (optional warning if mismatch)
      if (expectedRole && profile.role !== expectedRole) {
         return { 
           success: true, 
           email, 
           warning: `Role mismatch: Expected ${expectedRole}, got ${profile.role}`,
           user, 
           profile 
         };
      }

      return { success: true, email, user, profile };

    } catch (error) {
      console.error(`Verification error for ${email}:`, error);
      return { success: false, email, message: error.message };
    }
  },

  async verifyAdminAccount() {
    return this.verifyUserByEmail('admin@bangalienterprise.com', 'global_admin');
  },

  async verifyOwnerAccount() {
    return this.verifyUserByEmail('enterprisebangali@gmail.com', 'owner');
  },

  async verifyManagerAccount() {
    return this.verifyUserByEmail('arifhossenrakib001@gmail.com', 'manager');
  },

  async verifySellerAccount() {
    return this.verifyUserByEmail('mrak@virgilian.com', 'seller');
  },

  async verifyAllAccounts() {
    const admin = await this.verifyAdminAccount();
    const owner = await this.verifyOwnerAccount();
    const manager = await this.verifyManagerAccount();
    const seller = await this.verifySellerAccount();

    return {
      success: admin.success && owner.success && manager.success && seller.success,
      timestamp: new Date().toISOString(),
      results: [admin, owner, manager, seller]
    };
  }
};
