import { ROLES } from './roles';

export const PERMISSIONS = {
  // Owner Permissions
  MANAGE_TEAM: 'manage_team',
  MANAGE_BUSINESS: 'manage_business',
  VIEW_REPORTS: 'view_reports',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_SALES: 'manage_sales',
  MANAGE_EXPENSES: 'manage_expenses',
  MANAGE_COLLECTIONS: 'manage_collections',
  MANAGE_ROLES: 'manage_roles',
  
  // Seller specific
  CREATE_SALES: 'create_sales',
  VIEW_OWN_SALES: 'view_own_sales',
  MANAGE_OWN_COLLECTIONS: 'manage_own_collections',

  // Global Admin
  MANAGE_ALL_BUSINESSES: 'manage_all_businesses',
  MANAGE_ALL_USERS: 'manage_all_users',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs'
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.MANAGE_BUSINESS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_SALES,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.MANAGE_COLLECTIONS,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.MANAGE_ROLES
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_SALES,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.MANAGE_COLLECTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_SALES
  ],
  [ROLES.SELLER]: [
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.VIEW_OWN_SALES,
    PERMISSIONS.MANAGE_OWN_COLLECTIONS
  ],
  [ROLES.GLOBAL_ADMIN]: [
    PERMISSIONS.MANAGE_ALL_BUSINESSES,
    PERMISSIONS.MANAGE_ALL_USERS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.AUDIT_LOGS
  ]
};

// Export alias for compatibility
export const rolePermissions = ROLE_PERMISSIONS;

export const permissionCategories = {
  sales: {
    label: "Sales & Collections",
    permissions: [
      { id: PERMISSIONS.CREATE_SALES, label: "Create Sales", description: "Can create new sales records" },
      { id: PERMISSIONS.MANAGE_SALES, label: "Manage Sales", description: "Can view and edit all sales" },
      { id: PERMISSIONS.VIEW_OWN_SALES, label: "View Own Sales", description: "Can only view their own sales" },
      { id: PERMISSIONS.MANAGE_COLLECTIONS, label: "Manage Collections", description: "Can manage payment collections" },
    ]
  },
  inventory: {
    label: "Inventory Management",
    permissions: [
      { id: PERMISSIONS.MANAGE_PRODUCTS, label: "Manage Products", description: "Can add, edit, delete products" },
    ]
  },
  business: {
    label: "Business Management",
    permissions: [
      { id: PERMISSIONS.MANAGE_BUSINESS, label: "Manage Business", description: "Can update business settings" },
      { id: PERMISSIONS.MANAGE_TEAM, label: "Manage Team", description: "Can add or remove team members" },
      { id: PERMISSIONS.MANAGE_ROLES, label: "Manage Roles", description: "Can create and assign roles" },
      { id: PERMISSIONS.VIEW_REPORTS, label: "View Reports", description: "Can view financial reports" },
      { id: PERMISSIONS.MANAGE_EXPENSES, label: "Manage Expenses", description: "Can manage business expenses" },
    ]
  },
  admin: {
    label: "System Administration",
    permissions: [
      { id: PERMISSIONS.MANAGE_ALL_BUSINESSES, label: "Manage All Businesses", description: "Global admin only" },
      { id: PERMISSIONS.MANAGE_ALL_USERS, label: "Manage All Users", description: "Global admin only" },
      { id: PERMISSIONS.SYSTEM_SETTINGS, label: "System Settings", description: "Global admin only" },
    ]
  }
};

export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};