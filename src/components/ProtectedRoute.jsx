import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, hasPermission } from '@/lib/rolePermissions';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole, requiredBusinessType, allowUnauthenticated, requiredPermission }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (allowUnauthenticated) {
      return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Role Check
  if (requiredRole) {
      // If requiredRole is an array, check if user has ANY of the roles
      if (Array.isArray(requiredRole)) {
          if (!requiredRole.includes(user.role) && user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.OWNER) {
             return <Navigate to="/access-denied" replace />;
          }
      } else {
          // Single role check
          if (user.role !== requiredRole && user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.OWNER) {
             return <Navigate to="/access-denied" replace />;
          }
      }
  }

  // 2. Business Type Isolation
  if (requiredBusinessType && user.business_type !== requiredBusinessType && user.role !== ROLES.SUPER_ADMIN) {
      return <Navigate to="/access-denied" replace />;
  }
  
  // 3. Permission Check
  if (requiredPermission) {
      if (!hasPermission(user.role, requiredPermission, user.permissions)) {
          return <Navigate to="/access-denied" replace />;
      }
  }

  return children;
};

export default ProtectedRoute;