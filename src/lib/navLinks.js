import { 
  LayoutDashboard, ShoppingCart, Package, Users, Settings, 
  Briefcase, History, DollarSign, Layers, TrendingDown, 
  AlertTriangle, Gift, ClipboardList, Truck, FileText
} from 'lucide-react';
import { ROLES, PERMISSIONS } from '@/lib/rolePermissions';

export const RETAIL_OWNER_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/retail/dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'New Sale (POS)', path: '/retail/pos', icon: ShoppingCart },
  { id: 'sales-history', label: 'Sales History', path: '/retail/sales-history', icon: History },
  { id: 'due-collection', label: 'Due Collection', path: '/retail/due-collection', icon: DollarSign },
  { id: 'stock', label: 'Products & Stock', path: '/retail/stock', icon: Package },
  { id: 'categories', label: 'Categories', path: '/retail/categories', icon: Layers },
  { id: 'expenses', label: 'Expenses', path: '/retail/expenses', icon: TrendingDown },
  { id: 'damage', label: 'Damage', path: '/retail/damage', icon: AlertTriangle },
  { id: 'gift-cards', label: 'Gift Cards', path: '/retail/gift-cards', icon: Gift },
  { id: 'orders', label: 'Orders', path: '/retail/orders', icon: ClipboardList },
  { id: 'suppliers', label: 'Suppliers', path: '/retail/suppliers', icon: Truck },
  { id: 'team', label: 'Team', path: '/retail/team', icon: Users },
  { id: 'settings', label: 'Settings', path: '/retail/settings', icon: Settings },
];

export const RETAIL_MANAGER_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/retail/dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'New Sale (POS)', path: '/retail/pos', icon: ShoppingCart },
  { id: 'sales-history', label: 'Sales History', path: '/retail/sales-history', icon: History },
  { id: 'due-collection', label: 'Due Collection', path: '/retail/due-collection', icon: DollarSign },
  { id: 'stock', label: 'Products & Stock', path: '/retail/stock', icon: Package },
  { id: 'categories', label: 'Categories', path: '/retail/categories', icon: Layers },
  { id: 'expenses', label: 'Expenses', path: '/retail/expenses', icon: TrendingDown },
  { id: 'damage', label: 'Damage', path: '/retail/damage', icon: AlertTriangle },
  { id: 'gift-cards', label: 'Gift Cards', path: '/retail/gift-cards', icon: Gift },
  { id: 'orders', label: 'Orders', path: '/retail/orders', icon: ClipboardList },
  { id: 'suppliers', label: 'Suppliers', path: '/retail/suppliers', icon: Truck },
];

export const RETAIL_SELLER_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/retail/dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'New Sale (POS)', path: '/retail/pos', icon: ShoppingCart },
  { id: 'sales-history', label: 'My Sales', path: '/retail/sales-history', icon: History },
  { id: 'my-commission', label: 'My Commission', path: '/retail/profile', icon: DollarSign },
];

export const MENU_CONFIG = {
  retail: {
    owner: RETAIL_OWNER_MENU,
    manager: RETAIL_MANAGER_MENU,
    seller: RETAIL_SELLER_MENU,
  },
  agency: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', path: '/agency/projects', icon: Briefcase },
  ],
  education: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
  ],
  service: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
  ],
  freelancer: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
  ]
};

export const BUSINESS_MENUS = {
  retail: RETAIL_OWNER_MENU,
  agency: MENU_CONFIG.agency,
  education: MENU_CONFIG.education,
  service: MENU_CONFIG.service,
  freelancer: MENU_CONFIG.freelancer
};

export const getRetailMenu = (role) => {
  switch(role) {
    case ROLES.OWNER: return RETAIL_OWNER_MENU;
    case ROLES.MANAGER: return RETAIL_MANAGER_MENU;
    case ROLES.SELLER: return RETAIL_SELLER_MENU;
    default: return RETAIL_SELLER_MENU;
  }
};

export const getNavLinks = (businessType, userRole, userPermissions = {}) => {
  if (userRole === ROLES.SUPER_ADMIN) {
    return [
      { id: 'dashboard', label: 'Global Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'Users', path: '/admin/users', icon: Users },
      { id: 'businesses', label: 'Businesses', path: '/admin/businesses', icon: Briefcase },
      { id: 'cms', label: 'Website CMS', path: '/admin/cms', icon: FileText },
    ];
  }

  if (businessType === 'retail') {
    return getRetailMenu(userRole);
  }

  return BUSINESS_MENUS[businessType] || [];
};