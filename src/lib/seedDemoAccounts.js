
import { supabase } from '@/lib/supabase';

// This function is meant to be run manually or via a secret admin panel
// It uses client-side calls which might be restricted by RLS if not careful,
// but for demo purposes on a dev/test env it's useful.
// Ideally, this should be an Edge Function or SQL script.

export const seedDemoAccounts = async () => {
  const accounts = [
    { email: 'demo.owner@bangali-enterprise.test', password: 'DemoOwner@2026!', role: 'owner', name: 'Demo Owner' },
    { email: 'demo.manager@bangali-enterprise.test', password: 'DemoManager@2026!', role: 'manager', name: 'Demo Manager' },
    { email: 'demo.seller@bangali-enterprise.test', password: 'DemoSeller@2026!', role: 'seller', name: 'Demo Seller' }
  ];

  console.log("Starting demo account seeding...");

  for (const acc of accounts) {
    try {
      // 1. Try to sign up (if user doesn't exist)
      // Note: We cannot "check if user exists" easily without admin rights client-side,
      // so we just try to sign up and catch the error.
      const { data, error } = await supabase.auth.signUp({
        email: acc.email,
        password: acc.password,
        options: {
          data: {
            full_name: acc.name,
            role: acc.role,
            // Link them all to a demo business (in a real scenario, we'd create one first)
            business_name: 'Demo Bangali Enterprise' 
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`User ${acc.email} already exists.`);
        } else {
          console.error(`Error creating ${acc.email}:`, error.message);
        }
      } else {
        console.log(`Created user ${acc.email}`);
        
        // If it's the owner, we need to ensure the business is created (handled by trigger logic mostly)
        // But for demo consistency we might need to manually ensure things are linked.
      }

    } catch (e) {
      console.error("Unexpected error seeding:", e);
    }
  }

  console.log("Demo seeding process completed.");
};
