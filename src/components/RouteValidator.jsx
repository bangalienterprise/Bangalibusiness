import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const RouteValidator = ({ children, requiredType }) => {
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  if (businessLoading || authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin bypass
  if (user?.user_metadata?.role === 'admin') {
      return children;
  }

  // Check business type match
  if (activeBusiness && requiredType) {
      const currentType = activeBusiness.type?.toLowerCase();
      const required = requiredType.toLowerCase();
      
      if (currentType !== required) {
          console.warn(`Access denied: Route requires ${required}, user has ${currentType}`);
          return <Navigate to="/access-denied" replace state={{ reason: `This page is for ${required} businesses only.` }} />;
      }
  }

  return children;
};

export default RouteValidator;