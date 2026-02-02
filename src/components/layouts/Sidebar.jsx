
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useRole } from '@/contexts/RoleContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    LogOut, LayoutDashboard, ShoppingCart, Package, Layers, 
    FileText, Truck, Users, Settings, AlertTriangle, Gift, 
    ClipboardList, Banknote 
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
    const { logout, role } = useAuth();
    const { currentBusiness } = useBusiness();
    const { canViewFeature, FEATURES } = useRole();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/retail/dashboard', feature: FEATURES.DASHBOARD },
        { label: 'New Sale (POS)', icon: ShoppingCart, path: '/retail/pos', feature: FEATURES.POS },
        { label: 'Sales History', icon: ClipboardList, path: '/retail/sales-history', feature: FEATURES.SALES_HISTORY },
        { label: 'Products', icon: Package, path: '/retail/products', feature: FEATURES.PRODUCTS },
        { label: 'Categories', icon: Layers, path: '/retail/categories', feature: FEATURES.CATEGORIES },
        { label: 'Due Collection', icon: Banknote, path: '/retail/due-collection', feature: FEATURES.DUE_COLLECTION },
        { label: 'Expenses', icon: FileText, path: '/retail/expenses', feature: FEATURES.EXPENSES },
        { label: 'Suppliers', icon: Truck, path: '/retail/suppliers', feature: FEATURES.SUPPLIERS },
        { label: 'Damage Reports', icon: AlertTriangle, path: '/retail/damage', feature: FEATURES.DAMAGE },
        { label: 'Gift Cards', icon: Gift, path: '/retail/gift-cards', feature: FEATURES.GIFT_CARDS },
        { label: 'Orders', icon: ClipboardList, path: '/retail/orders', feature: FEATURES.ORDERS },
        { label: 'Team', icon: Users, path: '/retail/team', feature: FEATURES.TEAM },
        { label: 'Settings', icon: Settings, path: '/retail/settings', feature: FEATURES.SETTINGS },
    ];

    // Filter items based on permissions
    const visibleItems = menuItems.filter(item => canViewFeature(item.feature));

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-100 transition-transform duration-300 flex flex-col",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-lg truncate w-full">{currentBusiness?.name || 'Bangali Enterprise'}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{role?.replace('_', ' ')}</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                {visibleItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                            isActive 
                                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5 mr-3 transition-colors", 
                            "text-slate-500 group-hover:text-white"
                        )} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" 
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" /> 
                    Logout
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
