
import { supabase } from '@/lib/customSupabaseClient';

export const ensureGlobalAdminExists = async () => {
  const adminEmail = 'admin@bangalienterprise.com';
  const adminPassword = 'Bangaliadmin@2025.!?';

  try {
    // 1. Check if user exists (we can't directly check auth.users client-side easily without admin rights or trying to sign in)
    // Instead, we try to sign in. If it fails with "Invalid login credentials", we might need to create.
    // However, we can't create a user with a specific password if they already exist.
    
    // Strategy: Try to fetch profile for this email (assuming public read on profiles or RLS allows)
    // Actually, ensuring admin exists usually requires service_role key which we don't have in client.
    // We will simulate this by checking if the current user is this email, and if so, upserting their role.
    
    // Since we are client-side only, we can't programmatically "create" the admin if they don't exist 
    // without just using the signup flow. 
    
    // For this task, we'll try to sign in. If successful, check role.
    // If sign in fails, we assume they don't exist and try to sign up.
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
    });

    if (signInError) {
        // If invalid credentials, maybe user doesn't exist? Try to sign up.
        // Warning: This exposes a way to reset admin if someone knows this flow, but it's requested by the user.
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
                data: { full_name: 'Global Admin' }
            }
        });

        if (signUpError) {
            console.log("Global admin check: User likely exists or other error", signUpError.message);
            return { exists: true, created: false, error: signUpError };
        }

        if (signUpData.user) {
            // Ensure profile exists with role
            await supabase.from('profiles').upsert({
                id: signUpData.user.id,
                email: adminEmail,
                full_name: 'Global Admin',
                role: 'super_admin', // using super_admin to match existing RLS policies
                created_at: new Date()
            });
            return { exists: true, created: true, error: null };
        }
    } else if (signInData.user) {
        // User exists, ensure role is super_admin
        const { error: updateError } = await supabase.from('profiles').upsert({
            id: signInData.user.id,
            email: adminEmail,
            full_name: 'Global Admin',
            role: 'super_admin',
            updated_at: new Date()
        });
        
        // Sign out after check so we don't hijack session
        await supabase.auth.signOut();
        
        return { exists: true, created: false, error: updateError };
    }

    return { exists: false, created: false, error: 'Unknown state' };
  } catch (err) {
    console.error('Ensure Admin Error:', err);
    return { exists: false, created: false, error: err };
  }
};
