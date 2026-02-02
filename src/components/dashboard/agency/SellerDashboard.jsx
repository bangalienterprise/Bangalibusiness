import React from 'react';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import GenericDashboard from '@/components/dashboard/GenericDashboard';

const SellerDashboard = () => {
    return (
        <div>
             <SectionHeader title="My Projects" description="Contributor View" />
             <GenericDashboard />
        </div>
    );
};
export default SellerDashboard;