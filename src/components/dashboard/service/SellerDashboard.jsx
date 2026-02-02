import React from 'react';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import GenericDashboard from '@/components/dashboard/GenericDashboard';

const SellerDashboard = () => {
    return (
        <div>
             <SectionHeader title="My Appointments" description="Staff View" />
             <GenericDashboard />
        </div>
    );
};
export default SellerDashboard;