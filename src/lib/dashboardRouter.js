import React from 'react';
import AdminDashboard from '@/pages/AdminDashboard';
import OwnerDashboard from '@/pages/OwnerDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import SellerDashboard from '@/pages/SellerDashboard';

export const getDashboardComponent = (businessType, role) => {
    // 1. Role based routing priority
    if (role === 'admin') return <AdminDashboard />;
    if (role === 'manager') return <ManagerDashboard />;
    if (role === 'seller') return <SellerDashboard />;
    
    // 2. Owner routing (could be specific by business type, but for now OwnerDashboard is comprehensive)
    if (role === 'owner') return <OwnerDashboard businessType={businessType} />;

    return <SellerDashboard />; // Default fallback
};