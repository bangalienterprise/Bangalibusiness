import React from 'react';
import { Helmet } from 'react-helmet';
import UsersTable from '@/components/admin/UsersTable';

const UsersManagementPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>User Management - Admin - Bangali Enterprise</title>
            </Helmet>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">User Management</h1>
                <p className="text-muted-foreground">View and manage all registered users across the platform.</p>
            </div>

            <UsersTable />
        </div>
    );
};

export default UsersManagementPage;