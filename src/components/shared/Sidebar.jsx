
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText,
  Settings, LogOut, ChevronLeft, ChevronRight, Store,
  Briefcase, Wrench, Wallet, HelpCircle, Bell,
  Building2, Database, Shield, Activity, Gift, Truck, AlertOctagon,
  Layers, CreditCard, UserCircle, Utensils, ChefHat, BookOpen, Coffee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BangaliLogo from '@/components/BangaliLogo';

import { useBusiness } from '@/contexts/BusinessContext';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobile, closeMobileMenu }) => {
  const { user, profile, logout, role } = useAuth();
  const { currentBusiness } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "Logout failed" });
    }
  };

  const logoUrl = currentBusiness?.logo_url;
  const businessName = currentBusiness?.name || 'BANGALI';

  // --- MENU CONFIGURATION ---
  const retailNav = [
    { title: 'Dashboard', path: '/retail/dashboard', icon: LayoutDashboard },
    { title: 'New Sale (POS)', path: '/retail/pos', icon: ShoppingCart },
    { title: 'Sales History', path: '/retail/sales-history', icon: FileText },
    { title: 'Due Collection', path: '/retail/due-collection', icon: CreditCard },
    { title: 'Products & Stock', path: '/retail/products', icon: Package },
    { title: 'Categories', path: '/retail/categories', icon: Layers },
    { title: 'Expenses', path: '/retail/expenses', icon: Wallet },
    { title: 'Damage', path: '/retail/damage', icon: AlertOctagon, roles: ['owner', 'manager'] },
    { title: 'Gift Cards', path: '/retail/gift-cards', icon: Gift, roles: ['owner', 'manager'] },
    { title: 'Orders', path: '/retail/orders', icon: FileText },
    { title: 'Suppliers', path: '/retail/suppliers', icon: Truck, roles: ['owner', 'manager'] },
    { title: 'Team', path: '/retail/team', icon: Users, roles: ['owner', 'manager'] },
    { title: 'Settings', path: '/retail/settings', icon: Settings, roles: ['owner'] },
  ];

  const restaurantNav = [
    { title: 'Floor Plan', path: '/restaurant/floor-plan', icon: LayoutDashboard }, 
    { title: 'Kitchen View', path: '/restaurant/kitchen', icon: ChefHat },
    { title: 'Menu Manager', path: '/restaurant/menu', icon: BookOpen },
    { title: 'Orders', path: '/restaurant/orders', icon: Coffee },
    { title: 'Team', path: '/restaurant/team', icon: Users, roles: ['owner', 'manager'] },
    { title: 'Reports', path: '/restaurant/reports', icon: Activity },
    { title: 'Settings', path: '/restaurant/settings', icon: Settings, roles: ['owner'] },
  ];

  const agencyNav = [
    { title: 'Dashboard', path: '/agency/dashboard', icon: LayoutDashboard },
    { title: 'Projects', path: '/agency/projects', icon: Briefcase },
    { title: 'Clients', path: '/agency/clients', icon: Users },
    { title: 'Proposals', path: '/agency/proposals', icon: FileText },
    { title: 'Tasks', path: '/agency/tasks', icon: Layers },
    { title: 'Team', path: '/agency/team', icon: Users, roles: ['owner', 'manager'] },
    { title: 'Reports', path: '/agency/reports', icon: Activity },
    { title: 'Settings', path: '/agency/settings', icon: Settings, roles: ['owner'] },
  ];

  const serviceNav = [
    { title: 'Dashboard', path: '/service/dashboard', icon: LayoutDashboard },
    { title: 'Appointments', path: '/service/appointments', icon: FileText },
    { title: 'Calendar', path: '/service/calendar', icon: LayoutDashboard }, 
    { title: 'Services', path: '/service/services', icon: Briefcase },
    { title: 'Customers', path: '/service/customers', icon: Users },
    { title: 'Team', path: '/service/team', icon: Users, roles: ['owner', 'manager'] },
    { title: 'Reports', path: '/service/reports', icon: Activity },
    { title: 'Settings', path: '/service/settings', icon: Settings, roles: ['owner'] },
  ];

  const freelancerNav = [
    { title: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard },
    { title: 'Portfolio', path: '/freelancer/portfolio', icon: Briefcase },
    { title: 'Time Tracker', path: '/freelancer/time-tracker', icon: Activity },
    { title: 'Clients', path: '/freelancer/clients', icon: Users },
    { title: 'Invoices', path: '/freelancer/invoices', icon: FileText },
    { title: 'Reports', path: '/freelancer/reports', icon: Activity },
    { title: 'Settings', path: '/freelancer/settings', icon: Settings, roles: ['owner'] },
  ];

  const educationNav = [
    { title: 'Students', path: '/education/students', icon: Users },
    { title: 'Attendance', path: '/education/attendance', icon: FileText },
    { title: 'Courses', path: '/education/courses', icon: Briefcase },
    { title: 'Fees', path: '/education/fees', icon: CreditCard },
    { title: 'Reports', path: '/education/reports', icon: Activity },
    { title: 'Settings', path: '/education/settings', icon: Settings, roles: ['owner'] },
  ];

  const adminNav = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Businesses', path: '/admin/businesses', icon: Building2 },
    { title: 'Users', path: '/admin/users', icon: Users },
    { title: 'System Settings', path: '/admin/settings', icon: Settings },
    { title: 'Audit Logs', path: '/admin/audit-logs', icon: Activity },
    { title: 'Backups', path: '/admin/backups', icon: Database },
  ];

  const commonNav = [
    { title: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  let navItems = [];

  if (role === 'global_admin') {
    navItems = [...adminNav, ...commonNav];
  } else {
    // Determine which nav to use based on industry/type
    const type = currentBusiness?.type_slug || currentBusiness?.type || 'retail';
    const industry = type.toLowerCase();

    let industryNav = [];
    switch (industry) {
      case 'restaurant':
        industryNav = restaurantNav;
        break;
      case 'agency':
        industryNav = agencyNav;
        break;
      case 'service':
      case 'service_provider': 
        industryNav = serviceNav;
        break;
      case 'freelancer':
        industryNav = freelancerNav;
        break;
      case 'education':
        industryNav = educationNav;
        break;
      case 'wholesale':
      case 'manufacturing':
        industryNav = retailNav;
        break;
      case 'retail':
      case 'retail_store':
      default:
        industryNav = retailNav;
        break;
    }

    // Role based filtering
    navItems = [...industryNav.filter(item => !item.roles || item.roles.includes(role)), ...commonNav];
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-300 relative border-r",
        // Theme Styles
        "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
        isCollapsed ? "w-20" : "w-64",
        isMobile && "w-full"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <div className="shrink-0 text-green-600 dark:text-green-500">
            <BangaliLogo size="sm" logoUrl={logoUrl} />
          </div>
          <div className={cn("flex flex-col transition-opacity duration-200", isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100")}>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide truncate">{businessName}</span>
              <span className="font-bold text-slate-500 text-[0.6rem] tracking-wider uppercase">{currentBusiness?.industry || currentBusiness?.type_slug || 'Enterprise'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Summary (Above Nav) */}
      {!isCollapsed && !isMobile && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile?.full_name}</span>
              <span className="text-xs text-slate-500 truncate capitalize">{role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? closeMobileMenu : undefined}
              end={item.path === '/admin' || item.path === '/retail/dashboard' || item.path === '/agency/dashboard' || item.path === '/service/dashboard' || item.path === '/freelancer/dashboard' || item.path === '/restaurant/dashboard'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group relative",
                isActive
                  ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800",
                isCollapsed && !isMobile && "justify-center px-0"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", ({ isActive }) => isActive ? "text-blue-600 dark:text-blue-500" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white")} />
              <span className={cn(isCollapsed && !isMobile ? "hidden" : "block")}>
                {item.title}
              </span>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
                  {item.title}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-950">
        {/* User Dropdown for Settings/Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-2",
                isCollapsed && "justify-center"
              )}
            >
              <UserCircle className="h-5 w-5 shrink-0" />
              <span className={cn("ml-3", isCollapsed ? "hidden" : "block")}>Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 mb-2" align="start" side="right">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <DropdownMenuItem onClick={() => navigate('/retail/profile')} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
              <UserCircle className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> <span>Collapse</span></div>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
