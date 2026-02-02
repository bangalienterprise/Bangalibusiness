
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

/**
 * Service to initialize admin and default accounts
 */
export const adminSetupService = {
  
  async _createUser(email, password, metadata) {
    if (!supabaseAdmin) {
      return { success: false, message: 'Admin client not initialized (missing service key)' };
    }

    try {
      // 1. Create User in Auth
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata
      });

      if (userError) {
        // If user already exists, try to get their ID
        if (userError.message.includes('already registered') || userError.status === 422) {
             // We can't query auth.users directly without direct DB access usually,
             // but we can try to fetch their profile if it exists to get the ID.
             const { data: profile } = await supabaseAdmin
                 .from('profiles')
                 .select('id')
                 .eq('email', email)
                 .maybeSingle();
                 
             if (profile) return { success: true, userId: profile.id, isExisting: true };
             return { success: false, message: 'User exists in Auth but not in Profiles' };
        }
        throw userError;
      }

      const userId = userData.user.id;

      // 2. Create Profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email,
          full_name: metadata.full_name,
          role: metadata.role,
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      return { success: true, userId, isExisting: false };
    } catch (error) {
      console.error(`Error creating user ${email}:`, error);
      return { success: false, message: error.message };
    }
  },

  async ensureGlobalAdminExists() {
    const result = await this._createUser(
      'admin@bangalienterprise.com',
      'Bangaliadmin@2025.!?',
      { full_name: 'Bangali System Admin', role: 'global_admin' }
    );
    return { ...result, message: result.message || 'Global Admin verified/created' };
  },

  async ensureRetailOwnerExists() {
    const email = 'enterprisebangali@gmail.com';
    const result = await this._createUser(
      email,
      'RetailOwner123!',
      { full_name: 'Retail Owner', role: 'owner' }
    );

    if (!result.success && !result.isExisting) return result;

    if (supabaseAdmin) {
      // Ensure Business Exists
      const { data: business, error: bizError } = await supabaseAdmin
        .from('businesses')
        .upsert({ name: 'Abul Khayer Consumers', type: 'retail' }, { onConflict: 'name' })
        .select()
        .single();
        
      if (bizError) return { success: false, message: 'Failed to create business: ' + bizError.message };

      // Ensure Profile has business_id (legacy schema support)
      await supabaseAdmin.from('profiles').update({ business_id: business.id }).eq('id', result.userId);

      // Ensure Business User Entry
      await supabaseAdmin.from('business_users').upsert({
        business_id: business.id,
        user_id: result.userId,
        role: 'owner'
      }, { onConflict: 'business_id, user_id' });
      
      return { success: true, userId: result.userId, businessId: business.id, message: 'Retail Owner setup complete' };
    }

    return { success: false, message: 'Admin client missing' };
  },

  async ensureRetailManagerExists() {
    const ownerCheck = await supabase.from('businesses').select('id').eq('name', 'Abul Khayer Consumers').single();
    if (!ownerCheck.data) return { success: false, message: 'Business not found. Run Owner setup first.' };
    
    const result = await this._createUser(
      'arifhossenrakib001@gmail.com',
      'RetailManager123!',
      { full_name: 'Retail Manager', role: 'manager' }
    );

    if (result.success && supabaseAdmin) {
         await supabaseAdmin.from('profiles').update({ business_id: ownerCheck.data.id }).eq('id', result.userId);
         await supabaseAdmin.from('business_users').upsert({
            business_id: ownerCheck.data.id,
            user_id: result.userId,
            role: 'manager'
          }, { onConflict: 'business_id, user_id' });
    }

    return { ...result, message: result.message || 'Manager setup complete' };
  },

  async ensureRetailSellerExists() {
    const ownerCheck = await supabase.from('businesses').select('id').eq('name', 'Abul Khayer Consumers').single();
    if (!ownerCheck.data) return { success: false, message: 'Business not found' };

    const result = await this._createUser(
      'mrak@virgilian.com',
      'RetailSeller123!',
      { full_name: 'Retail Seller', role: 'seller' }
    );

    if (result.success && supabaseAdmin) {
         await supabaseAdmin.from('profiles').update({ business_id: ownerCheck.data.id }).eq('id', result.userId);
         await supabaseAdmin.from('business_users').upsert({
            business_id: ownerCheck.data.id,
            user_id: result.userId,
            role: 'seller'
          }, { onConflict: 'business_id, user_id' });
    }

    return { ...result, message: result.message || 'Seller setup complete' };
  },

  async initializeAllAccounts() {
    console.log('Starting account initialization...');
    const admin = await this.ensureGlobalAdminExists();
    const owner = await this.ensureRetailOwnerExists();
    const manager = await this.ensureRetailManagerExists();
    const seller = await this.ensureRetailSellerExists();

    return {
      allSuccess: admin.success && owner.success,
      results: [admin, owner, manager, seller]
    };
  }
};
