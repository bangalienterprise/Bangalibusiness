import { 
  LayoutDashboard, ShoppingCart, Package, Users, Settings, 
  FileText, Briefcase, BarChart, DollarSign, Truck, Wallet, 
  Receipt, Calendar, Clock, CreditCard, GraduationCap, 
  BookOpen, FolderOpen, CheckSquare, Shield, Activity, Globe,
  Server
} from 'lucide-react';
import { ROLES, PERMISSIONS } from './rolePermissions';

export const MENU_CONFIG = {
  // --- RETAIL ---
  retail: {
    [ROLES.OWNER]: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'POS System', path: '/retail/pos', icon: ShoppingCart },
      { label: 'Stock Mgmt', path: '/retail/stock', icon: Package },
      { label: 'Sales History', path: '/retail/reports', icon: BarChart }, // Using reports as sales history
      { label: 'Customers', path: '/retail/customers', icon: Users },
      { label: 'Team', path: '/team', icon: Users },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
    [ROLES.MANAGER]: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Stock Mgmt', path: '/retail/stock', icon: Package },
      { label: 'Reports', path: '/retail/reports', icon: FileText },
    ],
    [ROLES.SELLER]: [
      { label: 'POS System', path: '/retail/pos', icon: ShoppingCart },
    ]
  },

  // --- AGENCY ---
  agency: {
    [ROLES.OWNER]: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Projects', path: '/agency/projects', icon: FolderOpen },
      { label: 'Tasks', path: '/agency/tasks', icon: CheckSquare },
      { label: 'Clients', path: '/agency/client-portal', icon: Users }, // Reusing client portal or team page
      { label: 'Invoices', path: '/agency/invoices', icon: DollarSign },
      { label: 'Team', path: '/team', icon: Users },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  },

  // --- EDUCATION ---
  education: {
    [ROLES.OWNER]: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Students', path: '/education/students', icon: GraduationCap },
      { label: 'Courses', path: '/education/courses', icon: BookOpen },
      { label: 'Fees', path: '/education/fees', icon: Wallet },
      { label: 'Attendance', path: '/education/attendance', icon: Clock },
      { label: 'Results', path: '/education/results', icon: FileText },
      { label: 'Team', path: '/team', icon: Users },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  },

  // --- SERVICE ---
  service: {
    [ROLES.OWNER]: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Appointments', path: '/service/booking-calendar', icon: Calendar },
      { label: 'Services', path: '/service/services', icon: Briefcase },
      { label: 'Staff', path: '/service/staff', icon: Users },
      { label: 'Customers', path: '/service/customers', icon: Users },
      { label: 'Invoices', path: '/service/invoices', icon: Receipt },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  },

  // --- FREELANCER ---
  freelancer: {
    [ROLES.OWNER]: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Time Tracker', path: '/freelancer/time-tracker', icon: Clock },
      { label: 'Invoices', path: '/freelancer/invoices', icon: DollarSign },
      { label: 'Portfolio', path: '/freelancer/portfolio', icon: Briefcase },
      { label: 'Clients', path: '/freelancer/clients', icon: Users },
      { label: 'Payments', path: '/freelancer/payments', icon: CreditCard },
      { label: 'Settings', path: '/settings', icon: Settings },
    ]
  },

  // --- SUPER ADMIN ---
  [ROLES.SUPER_ADMIN]: [
    { label: 'Global Dashboard', path: '/admin/global-dashboard', icon: Activity },
    { label: 'Business Overwatch', path: '/admin/business-overwatch', icon: Shield },
    { label: 'Website CMS', path: '/admin/website-cms', icon: Globe },
    { label: 'User Mgmt', path: '/admin/user-management', icon: Users },
    { label: 'System Settings', path: '/admin/settings', icon: Server },
  ]
};