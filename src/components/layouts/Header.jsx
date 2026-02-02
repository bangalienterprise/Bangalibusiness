
import React from 'react';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import BusinessSelector from '@/components/BusinessSelector';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user, profile, role, logout, isGlobalAdmin } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  const handleLogout = async () => {
      await logout();
      navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-300" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        {isGlobalAdmin() && <BusinessSelector />}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{profile?.full_name || user?.email}</span>
            <span className="text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 capitalize">
                {role?.replace('_', ' ')}
            </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-slate-800 hover:ring-slate-700 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-600 text-white font-bold">
                    {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
            <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-slate-800 focus:bg-slate-800">
              <UserCircle className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-950/30 focus:bg-red-950/30">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
