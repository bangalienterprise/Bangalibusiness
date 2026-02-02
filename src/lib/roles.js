export const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  SELLER: 'seller',
  GLOBAL_ADMIN: 'global_admin'
};

export const getRoleLabel = (role) => {
  switch (role) {
    case ROLES.OWNER:
      return 'Business Owner';
    case ROLES.MANAGER:
      return 'Manager';
    case ROLES.SELLER:
      return 'Seller';
    case ROLES.GLOBAL_ADMIN:
      return 'System Administrator';
    default:
      return 'User';
  }
};