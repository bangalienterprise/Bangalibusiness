export const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  SELLER: 'seller', // Retail
  TEACHER: 'teacher', // Education
  STAFF: 'staff', // Service
  SUPER_ADMIN: 'super_admin'
};

export const PERMISSIONS = {
  // Retail / General
  CAN_SELL: 'can_sell',
  CAN_VIEW_FINANCIALS: 'can_view_financials',
  CAN_MANAGE_SETTINGS: 'can_manage_settings',
  CAN_DELETE_ITEMS: 'can_delete_items',
  CAN_MANAGE_TEAM: 'can_manage_team',
  CAN_VIEW_COST: 'can_view_cost',
  CAN_OVERRIDE_PRICE: 'can_override_price',
  CAN_MANAGE_INVENTORY: 'can_manage_inventory',
  CAN_MANAGE_CUSTOMERS: 'can_manage_customers',

  // Commission
  CAN_VIEW_COMMISSIONS: 'can_view_commissions',
  CAN_EDIT_COMMISSIONS: 'can_edit_commissions',
  CAN_VIEW_COMMISSION_REPORTS: 'can_view_commission_reports',

  // Agency / Projects
  CAN_MANAGE_PROJECTS: 'can_manage_projects',
  CAN_MANAGE_TASKS: 'can_manage_tasks',

  // Education
  CAN_MANAGE_STUDENTS: 'can_manage_students',
  CAN_MANAGE_FEES: 'can_manage_fees',

  // Global
  CAN_EDIT_WEBSITE: 'can_edit_website',
  CAN_MANAGE_BUSINESSES: 'can_manage_businesses'
};

// Default permissions applied when a user is created with a specific role
export const ROLE_DEFAULT_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS), // All permissions
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.MANAGER]: [
    PERMISSIONS.CAN_SELL,
    PERMISSIONS.CAN_MANAGE_INVENTORY,
    PERMISSIONS.CAN_MANAGE_CUSTOMERS,
    PERMISSIONS.CAN_MANAGE_PROJECTS,
    PERMISSIONS.CAN_MANAGE_TASKS,
    PERMISSIONS.CAN_MANAGE_STUDENTS,
    PERMISSIONS.CAN_VIEW_COST,
    PERMISSIONS.CAN_VIEW_COMMISSIONS // Conditional view usually, but defaults true for manager to view *some*
  ],

  [ROLES.SELLER]: [
    PERMISSIONS.CAN_SELL,
    PERMISSIONS.CAN_MANAGE_CUSTOMERS,
    PERMISSIONS.CAN_VIEW_COMMISSIONS // Can view own
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.CAN_MANAGE_STUDENTS,
    PERMISSIONS.CAN_MANAGE_TASKS
  ],

  [ROLES.STAFF]: [
    PERMISSIONS.CAN_MANAGE_TASKS
  ]
};

export const MANAGER_DEFAULT_PERMISSIONS = {
  [PERMISSIONS.CAN_SELL]: true,
  [PERMISSIONS.CAN_MANAGE_INVENTORY]: true,
  [PERMISSIONS.CAN_MANAGE_CUSTOMERS]: true,
  [PERMISSIONS.CAN_MANAGE_PROJECTS]: true,
  [PERMISSIONS.CAN_MANAGE_TASKS]: true,
  [PERMISSIONS.CAN_MANAGE_STUDENTS]: true,
  [PERMISSIONS.CAN_VIEW_COST]: true,
  [PERMISSIONS.CAN_VIEW_FINANCIALS]: false,
  [PERMISSIONS.CAN_MANAGE_SETTINGS]: false,
  [PERMISSIONS.CAN_DELETE_ITEMS]: false,
  [PERMISSIONS.CAN_MANAGE_TEAM]: false,
  [PERMISSIONS.CAN_OVERRIDE_PRICE]: false,
  [PERMISSIONS.CAN_VIEW_COMMISSIONS]: true,
  [PERMISSIONS.CAN_EDIT_COMMISSIONS]: false,
  [PERMISSIONS.CAN_VIEW_COMMISSION_REPORTS]: false
};

export const CONFIGURABLE_PERMISSIONS = [
  PERMISSIONS.CAN_VIEW_FINANCIALS,
  PERMISSIONS.CAN_MANAGE_SETTINGS,
  PERMISSIONS.CAN_DELETE_ITEMS,
  PERMISSIONS.CAN_MANAGE_TEAM,
  PERMISSIONS.CAN_VIEW_COST,
  PERMISSIONS.CAN_OVERRIDE_PRICE,
  PERMISSIONS.CAN_MANAGE_INVENTORY,
  PERMISSIONS.CAN_VIEW_COMMISSION_REPORTS
];

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.CAN_SELL]: 'Create and process sales transactions',
  [PERMISSIONS.CAN_VIEW_FINANCIALS]: 'View financial reports and profit margins',
  [PERMISSIONS.CAN_MANAGE_SETTINGS]: 'Modify business settings and configurations',
  [PERMISSIONS.CAN_DELETE_ITEMS]: 'Delete sales records, products, or other items',
  [PERMISSIONS.CAN_MANAGE_TEAM]: 'Add, edit, or remove team members',
  [PERMISSIONS.CAN_VIEW_COST]: 'View product costs and profit calculations',
  [PERMISSIONS.CAN_OVERRIDE_PRICE]: 'Override product prices at point of sale',
  [PERMISSIONS.CAN_MANAGE_INVENTORY]: 'Manage stock levels and inventory',
  [PERMISSIONS.CAN_MANAGE_CUSTOMERS]: 'Create and manage customer records',
  [PERMISSIONS.CAN_MANAGE_PROJECTS]: 'Create and manage projects',
  [PERMISSIONS.CAN_MANAGE_TASKS]: 'Create and manage tasks',
  [PERMISSIONS.CAN_MANAGE_STUDENTS]: 'Manage student records and enrollment',
  [PERMISSIONS.CAN_MANAGE_FEES]: 'Manage fee collection and payments',
  [PERMISSIONS.CAN_EDIT_WEBSITE]: 'Edit website content and pages',
  [PERMISSIONS.CAN_MANAGE_BUSINESSES]: 'Manage multiple businesses',
  [PERMISSIONS.CAN_VIEW_COMMISSIONS]: 'View commission details',
  [PERMISSIONS.CAN_EDIT_COMMISSIONS]: 'Edit commission structures for users',
  [PERMISSIONS.CAN_VIEW_COMMISSION_REPORTS]: 'View aggregated commission reports'
};

export const FORBIDDEN_PERMISSIONS = [
  // Permissions that should never be granted to non-owners
  PERMISSIONS.CAN_MANAGE_BUSINESSES,
  PERMISSIONS.CAN_EDIT_WEBSITE
];

export const PERMISSION_RISK_LEVELS = {
  [PERMISSIONS.CAN_SELL]: 'low',
  [PERMISSIONS.CAN_VIEW_FINANCIALS]: 'high',
  [PERMISSIONS.CAN_MANAGE_SETTINGS]: 'high',
  [PERMISSIONS.CAN_DELETE_ITEMS]: 'high',
  [PERMISSIONS.CAN_MANAGE_TEAM]: 'medium',
  [PERMISSIONS.CAN_VIEW_COST]: 'medium',
  [PERMISSIONS.CAN_OVERRIDE_PRICE]: 'medium',
  [PERMISSIONS.CAN_MANAGE_INVENTORY]: 'low',
  [PERMISSIONS.CAN_MANAGE_CUSTOMERS]: 'low',
  [PERMISSIONS.CAN_MANAGE_PROJECTS]: 'low',
  [PERMISSIONS.CAN_MANAGE_TASKS]: 'low',
  [PERMISSIONS.CAN_MANAGE_STUDENTS]: 'low',
  [PERMISSIONS.CAN_MANAGE_FEES]: 'medium',
  [PERMISSIONS.CAN_EDIT_WEBSITE]: 'high',
  [PERMISSIONS.CAN_MANAGE_BUSINESSES]: 'high',
  [PERMISSIONS.CAN_VIEW_COMMISSIONS]: 'low',
  [PERMISSIONS.CAN_EDIT_COMMISSIONS]: 'high',
  [PERMISSIONS.CAN_VIEW_COMMISSION_REPORTS]: 'medium'
};

export const hasPermission = (userRole, permission, userPermissions = []) => {
  if (userRole === ROLES.OWNER || userRole === ROLES.SUPER_ADMIN) return true;

  if (Array.isArray(userPermissions)) {
    if (userPermissions.includes(permission)) return true;
    // If explicit allow logic is needed (e.g. deny vs allow), we assume presence = allow.
  }

  // Backward compatibility object check (if needed)
  if (userPermissions && !Array.isArray(userPermissions) && typeof userPermissions[permission] !== 'undefined') {
    return userPermissions[permission];
  }

  const defaults = ROLE_DEFAULT_PERMISSIONS[userRole] || [];
  return defaults.includes(permission);
};

export const getAvailablePermissions = (role) => {
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
};