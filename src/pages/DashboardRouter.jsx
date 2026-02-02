
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import RetailDashboard from '@/pages/retail/RetailDashboard';
import ServiceDashboard from '@/pages/service/ServiceDashboard';
import AgencyDashboard from '@/pages/agency/AgencyDashboard';
import FreelancerDashboard from '@/pages/freelancer/FreelancerDashboard';
import { Loader2 } from 'lucide-react';

const DashboardRouter = () => {
  const { business, loading, role, user } = useAuth();

  if (loading) {
    return <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  if (!user) {
      return <Navigate to="/login" replace />;
  }

  // Admin redirect
  if (role === 'global_admin') {
    return <Navigate to="/admin" replace />;
  }

  if (!business) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-white">No Business Found</h2>
            <p className="text-slate-400">Please contact support or create a business.</p>
        </div>
    );
  }

  // Normalize business type string for comparison
  const type = business.type?.toLowerCase() || 'retail';

  if (type.includes('service') || type.includes('restaurant')) return <ServiceDashboard />;
  if (type.includes('agency')) return <AgencyDashboard />;
  if (type.includes('freelancer')) return <FreelancerDashboard />;
  
  // Default to retail for stores, education, or unknown
  return <RetailDashboard />;
};

export default DashboardRouter;
