
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCanAccessBusiness } from '@/hooks/useRLSCheck';
import { Loader2 } from 'lucide-react';

const BusinessRouteGuard = ({ children, businessId }) => {
    const { user, loading: authLoading } = useAuth();
    const { canAccess, loading: rlsLoading } = useCanAccessBusiness(businessId);

    if (authLoading || rlsLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!canAccess) {
        return <Navigate to="/retail/dashboard" state={{ error: "You don't have access to this business" }} replace />;
    }

    return children;
};

export default BusinessRouteGuard;
