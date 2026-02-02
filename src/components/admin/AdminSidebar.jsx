
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  FileText, 
  Database, 
  Shield, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import BangaliLogoFull from '@/components/BangaliLogoFull';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminSidebar = () => {
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/businesses', icon: Building2, label: 'Businesses' },
    { to: '/admin/users', icon: Users, label: 'Users & Roles' },
    { to: '/admin/settings', icon: Settings, label: 'System Settings' },
    { to: '/admin/logs', icon: FileText, label: 'Audit Logs' },
    // { to: '/admin/backups', icon: Database, label: 'Backups' }, // Not creating backup page yet
    { to: '/admin/profile', icon: Shield, label: 'Profile & Security' },
  ];

  return (
    <>
        {/* Mobile Toggle */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
            <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
                <Menu className="h-4 w-4" />
            </Button>
        </div>

        {/* Sidebar */}
        <aside className={cn(
            "fixed inset-y-0 left-0 z-40 bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col",
            collapsed ? "w-20" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Header */}
            <div className={cn("h-16 flex items-center border-b border-slate-800", collapsed ? "justify-center" : "px-6 justify-between")}>
                {!collapsed && <BangaliLogoFull size="sm" />}
                {collapsed && <span className="font-bold text-white">BE</span>}
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden lg:flex text-slate-400 hover:text-white"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex items-center p-3 rounded-lg transition-colors",
                            isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className={cn("flex items-center gap-3", collapsed && "justify-center flex-col")}>
                    <Avatar className="h-9 w-9 border border-slate-700">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-blue-600 text-white font-bold">
                            {profile?.full_name?.[0] || 'A'}
                        </AvatarFallback>
                    </Avatar>
                    
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                
                <Button 
                    variant="ghost" 
                    className={cn("w-full mt-4 text-red-400 hover:text-red-300 hover:bg-red-950/20", collapsed ? "px-0" : "justify-start")}
                    onClick={handleLogout}
                >
                    <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && "Logout"}
                </Button>
            </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setMobileOpen(false)}
            />
        )}
    </>
  );
};

export default AdminSidebar;
