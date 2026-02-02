
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RetailDashboard from './RetailDashboard';
import ServiceDashboard from '@/pages/service/ServiceDashboard';
import AgencyDashboard from '@/pages/agency/AgencyDashboard';
import FreelancerDashboard from '@/pages/freelancer/FreelancerDashboard';

const DashboardPage = () => {
    const { business } = useAuth();
    
    // Determine which dashboard to show based on business type
    // Fallback to RetailDashboard if type is undefined
    const type = business?.type?.toLowerCase() || 'retail_store';

    if (type.includes('service')) return <ServiceDashboard />;
    if (type.includes('agency')) return <AgencyDashboard />;
    if (type.includes('freelancer')) return <FreelancerDashboard />;
    
    // Default to retail
    return <RetailDashboard />;
};

export default DashboardPage;
