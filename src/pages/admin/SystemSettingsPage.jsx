import React from 'react';
import { Helmet } from 'react-helmet';
import SystemSettingsForm from '@/components/admin/SystemSettingsForm';

const SystemSettingsPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>System Settings - Admin - Bangali Enterprise</title>
            </Helmet>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">System Settings</h1>
                <p className="text-muted-foreground">Configure global application parameters and integrations.</p>
            </div>

            <SystemSettingsForm />
        </div>
    );
};

export default SystemSettingsPage;