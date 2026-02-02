import React from 'react';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import GenericDashboard from '@/components/dashboard/GenericDashboard';

const ManagerDashboard = () => {
    return (
        <div>
             <SectionHeader title="Service Management" description="Manager View" />
             <GenericDashboard />
        </div>
    );
};
export default ManagerDashboard;