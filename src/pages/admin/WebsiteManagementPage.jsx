import React from 'react';
import { Helmet } from 'react-helmet';
import WebsiteEditor from '@/components/admin/WebsiteEditor';

const WebsiteManagementPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Website Management - Admin - Bangali Enterprise</title>
            </Helmet>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Website Management</h1>
                <p className="text-muted-foreground">Customize your landing page and public facing content.</p>
            </div>

            <WebsiteEditor />
        </div>
    );
};

export default WebsiteManagementPage;