import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, hasPermission } from '@/lib/rolePermissions';
import { Loader2 } from 'lucide-react';

const RouteGuard = ({ children, requiredRole, requiredBusinessType, requiredPermission, allowUnauthenticated }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400 animate-pulse">Verifying access...</p>
      </div>
    );
  }

  // Public Routes
  if (allowUnauthenticated) {
    if (isAuthenticated && location.pathname === '/login') {
       return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // Not Authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super Admin Bypass
  if (user.role === ROLES.SUPER_ADMIN) {
    return children;
  }

  // Business Type Isolation
  if (requiredBusinessType && user.business_type !== requiredBusinessType) {
     console.warn(`Access Denied: User type ${user.business_type} -> ${requiredBusinessType}`);
     return <Navigate to="/access-denied" replace />;
  }

  // Permission Check
  if (requiredPermission) {
    if (!hasPermission(user.role, requiredPermission, user.permissions)) {
      console.warn(`Access Denied: Missing permission ${requiredPermission}`);
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Role Check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
       // Owner exception
       if (user.role !== ROLES.OWNER) {
          console.warn(`Access Denied: Role ${user.role} not in [${roles.join(', ')}]`);
          return <Navigate to="/access-denied" replace />;
       }
    }
  }

  return children;
};

export default RouteGuard;