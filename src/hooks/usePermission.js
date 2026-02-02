
import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  hasPermission as checkPermission, 
  canPerformAction as checkAction,
  getAvailablePermissions as getAvailable,
  getRestrictedPermissions as getRestricted
} from '@/utils/permissionUtils';

export const usePermission = () => {
  const { user, profile, loading } = useAuth();

  const effectiveUser = useMemo(() => {
    if (!user) return null;
    return { ...user, ...profile };
  }, [user, profile]);

  const hasPermission = (permissionName) => {
    if (loading || !effectiveUser) return false;
    return checkPermission(effectiveUser, permissionName);
  };

  const canPerformAction = (action) => {
    if (loading || !effectiveUser) return false;
    return checkAction(effectiveUser, action);
  };
  
  const availablePermissions = useMemo(() => {
      if (!effectiveUser) return [];
      return getAvailable(effectiveUser.role);
  }, [effectiveUser]);
  
  const restrictedPermissions = useMemo(() => {
      if (!effectiveUser) return [];
      return getRestricted(effectiveUser);
  }, [effectiveUser]);

  return {
    hasPermission,
    canPerformAction,
    userRole: effectiveUser?.role,
    availablePermissions,
    restrictedPermissions,
    loading
  };
};
