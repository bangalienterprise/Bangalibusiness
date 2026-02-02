
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRouteGuard = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user || user.role !== 'super_admin') {
        return <Navigate to="/login" state={{ message: "Admin access required" }} replace />;
    }

    return children;
};

export default AdminRouteGuard;
