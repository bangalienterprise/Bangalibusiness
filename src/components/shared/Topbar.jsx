import React from 'react';
import { Bell, Search, Menu, User, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BangaliLogo from '@/components/BangaliLogo';
import { cn } from '@/lib/utils';

const Topbar = ({ onMenuClick, title }) => {
  const { user, profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Helper to check if effectively dark
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30 px-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 dark:text-slate-400" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Mobile Logo View */}
        <div className="flex items-center gap-3 md:hidden">
            <BangaliLogo size="sm" />
             <div className="flex flex-col leading-none">
                <span className="font-bold text-[#16a34a] text-sm tracking-wide">BANGALI</span>
            </div>
        </div>

        {/* Desktop Title / Breadcrumbs */}
        {title && <h1 className="text-lg font-semibold text-slate-900 dark:text-white hidden md:block">{title}</h1>}
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-[#16a34a] focus:border-[#16a34a] placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={toggleTheme}>
           {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#16a34a]"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
              <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt={user?.email} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
            <DropdownMenuItem className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
            <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer" onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;