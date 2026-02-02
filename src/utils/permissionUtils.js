import { ROLES, PERMISSIONS, FORBIDDEN_PERMISSIONS, PERMISSION_DESCRIPTIONS, PERMISSION_RISK_LEVELS } from '@/lib/rolePermissions';

export const hasPermission = (user, permissionName) => {
  if (!user) return false;

  const role = user.role || user.user_metadata?.role;
  
  // Super Admins have all permissions
  if (role === ROLES.SUPER_ADMIN) return true;

  // Owners have all permissions except explicitly forbidden ones (if any defined for owners)
  if (role === ROLES.OWNER) {
    // Owners usually have everything relevant to business
    return true; 
  }

  // Check forbidden list for non-owners
  if (FORBIDDEN_PERMISSIONS.includes(permissionName)) {
    return false;
  }

  // Check user-specific permissions
  const userPermissions = user.permissions || user.user_metadata?.permissions || [];
  
  // Fallback for managers without specific permission array (legacy support)
  if (role === ROLES.MANAGER && (!userPermissions || userPermissions.length === 0)) {
     // Default manager permissions could be checked here, or strictly enforce array
     // For safety, strictly enforce array for configurable roles
     return false; 
  }
  
  // Sellers usually have fixed permissions, but we can check the array too
  if (role === ROLES.SELLER && (!userPermissions || userPermissions.length === 0)) {
      return [PERMISSIONS.CAN_SELL, PERMISSIONS.CAN_VIEW_ORDERS].includes(permissionName);
  }

  return userPermissions.includes(permissionName);
};

export const canPerformAction = (user, action) => {
  return hasPermission(user, action);
};

export const getAvailablePermissions = (role) => {
   // Logic to filter available permissions based on role hierarchy
   return Object.values(PERMISSIONS);
};

export const getRestrictedPermissions = (user) => {
  // If we had a full list of all possible perms, we could diff against user.permissions
  return FORBIDDEN_PERMISSIONS;
};

export const formatPermissionName = (name) => {
  if (!name) return '';
  // Convert can_manage_stock to "Manage Stock"
  return name
    .replace(/^can_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getPermissionDescription = (name) => {
  return PERMISSION_DESCRIPTIONS[name] || formatPermissionName(name);
};

export const checkPermissionRisk = (permission) => {
  return PERMISSION_RISK_LEVELS[permission] || 'low';
};