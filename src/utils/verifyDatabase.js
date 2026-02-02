
import { supabase } from '@/lib/customSupabaseClient';

export const verifyDatabaseSetup = async () => {
    const results = {
        success: true,
        tables: [],
        business: null,
        accounts: [],
        error: null
    };

    try {
        console.log("Starting Database Verification...");

        // Check if we have a session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            console.warn("No active session found during verification. RLS checks will likely fail.");
            results.error = "Not authenticated. Please log in to verify database.";
            results.success = false;
            // Continue anyway to see what's public
        }

        // 1. Verify Tables
        const requiredTables = [
            'profiles', 'businesses', 'business_types', 'business_users',
            'products', 'categories', 'suppliers', 'customers',
            'orders', 'order_items', 'sales_transactions', 'sales_items',
            'expenses', 'system_settings', 'business_settings', 'audit_logs'
        ];

        for (const table of requiredTables) {
            try {
                const { error } = await supabase.from(table).select('id').limit(1);
                if (error) {
                    if (error.code === '42501' || (error.message && error.message.includes('permission denied'))) {
                        // RLS denied access, but table likely exists
                        results.tables.push({ name: table, status: 'protected', message: 'RLS Protected (OK)' });
                    } else {
                        console.error(`Missing table or error: ${table}`, error);
                        results.tables.push({ name: table, status: 'missing', error: error.message });
                        // Don't fail success just for RLS, but fail for missing
                        if (error.code !== '42501') results.success = false;
                    }
                } else {
                    results.tables.push({ name: table, status: 'ok' });
                }
            } catch (e) {
                results.tables.push({ name: table, status: 'error', error: e.message });
            }
        }

        // 2. Verify Business Types Seeding
        const { data: types, error: typesError } = await supabase.from('business_types').select('*');
        if (typesError) {
             if (typesError.code === '42501') {
                 console.warn("Cannot verify business types due to RLS");
             } else {
                 results.error = "Error fetching business types";
             }
        } else if (!types || types.length < 1) {
             // Only flag error if we successfully queried but got nothing
             results.error = "Business Types not fully seeded";
        }

        // 3. Verify specific business
        const { data: business, error: bizError } = await supabase.from('businesses').select('*').eq('name', 'Abul Khayer Consumers').single();
        if (bizError && bizError.code !== 'PGRST116') {
             // Ignore not found or RLS
        } else if (business) {
            results.business = business;
        }

        // 4. Verify Test Accounts
        const emails = [
            'admin@bangalienterprise.com',
            'enterprisebangali@gmail.com',
            'arifhossenrakib001@gmail.com',
            'mrak@virgilian.com'
        ];

        for (const email of emails) {
            // We might not be able to query profiles if not admin
            const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();
            if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
                results.accounts.push({ email, exists: 'unknown', status: 'protected' });
            } else {
                results.accounts.push({ email, exists: !!data, role: data?.role });
            }
        }

        console.log("Database Verification Complete", results);
        return results;

    } catch (err) {
        console.error("Verification crashed", err);
        results.success = false;
        results.error = err.message;
        return results;
    }
};
