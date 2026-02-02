import React from 'react';
import { Helmet } from 'react-helmet';
import BusinessTypeConfigurator from '@/components/admin/BusinessTypeConfigurator';

const BusinessTypeManagementPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Business Types - Admin - Bangali Enterprise</title>
            </Helmet>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Business Type Configuration</h1>
                <p className="text-muted-foreground">Manage available business modules and their default settings.</p>
            </div>

            <BusinessTypeConfigurator />
        </div>
    );
};

export default BusinessTypeManagementPage;