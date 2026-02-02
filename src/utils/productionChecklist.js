
import { supabaseHealthCheck } from './supabaseHealthCheck';
import { accountVerification } from './accountVerification';
import { dataIntegrityCheck } from './dataIntegrityCheck';

export const productionChecklist = {
    async runProductionChecklist() {
        // Run all checks in parallel
        const [health, accounts, integrity] = await Promise.all([
            supabaseHealthCheck.runFullHealthCheck(),
            accountVerification.verifyAllAccounts(),
            dataIntegrityCheck.runFullDataIntegrityCheck()
        ]);
        
        const checks = {
            databaseConnection: health.results.connection.success,
            tablesExist: health.results.tables.success,
            rlsEnabled: health.results.rls.success,
            accountsCreated: accounts.success,
            dataConsistent: integrity.success,
            httpsEnabled: window.location.protocol === 'https:' || import.meta.env.VITE_APP_URL.includes('https')
        };
        
        const issues = [];
        if (!checks.databaseConnection) issues.push("Database connection failed");
        if (!checks.tablesExist) issues.push("Missing database tables");
        if (!checks.rlsEnabled) issues.push("RLS Policies not active");
        if (!checks.accountsCreated) issues.push("Core accounts missing");
        if (!checks.dataConsistent) issues.push("Data integrity issues found");
        
        return {
            ready: issues.length === 0,
            checks,
            issues
        };
    }
};
