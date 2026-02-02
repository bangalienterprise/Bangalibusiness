import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/rolePermissions';
import OwnerDashboard from '@/pages/retail/OwnerDashboard';
import ManagerDashboard from '@/pages/retail/ManagerDashboard';
import SellerDashboard from '@/pages/retail/SellerDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) return null;

    if (user.role === ROLES.OWNER) {
        return <OwnerDashboard />;
    }
    
    if (user.role === ROLES.MANAGER) {
        return <ManagerDashboard />;
    }
    
    if (user.role === ROLES.SELLER) {
        return <SellerDashboard />;
    }

    // Default Fallback
    return <SellerDashboard />;
};

export default Dashboard;