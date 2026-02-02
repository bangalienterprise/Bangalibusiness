
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/shared/Sidebar';
import Topbar from '@/components/shared/Topbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;

    // Core
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('reports')) return 'Reports';

    // Retail
    if (path.includes('pos')) return 'Point of Sale';
    if (path.includes('products')) return 'Inventory';
    if (path.includes('sales-history')) return 'Sales History';
    if (path.includes('orders')) return 'Orders';
    if (path.includes('expenses')) return 'Expenses';
    if (path.includes('suppliers')) return 'Suppliers';
    if (path.includes('team')) return 'Team Management';
    if (path.includes('damage')) return 'Damage Management';
    if (path.includes('due-collection')) return 'Due Collection';
    if (path.includes('gift-cards')) return 'Gift Cards';
    if (path.includes('categories')) return 'Categories';

    // Agency
    if (path.includes('projects')) return 'Project Board';
    if (path.includes('clients')) return 'Client Portal';
    if (path.includes('proposals')) return 'Proposals';
    if (path.includes('tasks')) return 'Task Board';

    // Service
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('calendar')) return 'Booking Calendar';
    if (path.includes('services')) return 'Service Menu';
    if (path.includes('customers')) return 'Customer Database';

    // Freelancer
    if (path.includes('portfolio')) return 'Portfolio';
    if (path.includes('time-tracker')) return 'Time Tracker';
    if (path.includes('invoices')) return 'Invoices';

    // Education
    if (path.includes('students')) return 'Student List';
    if (path.includes('attendance')) return 'Attendance';
    if (path.includes('courses')) return 'Course Manager';
    if (path.includes('fees')) return 'Fee Collection';

    // Admin
    if (path.includes('admin/businesses')) return 'Business Management';
    if (path.includes('admin/users')) return 'User Management';
    if (path.includes('admin/audit-logs')) return 'Audit Logs';
    if (path.includes('admin/backups')) return 'System Backups';

    return 'Bangali Enterprise';
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobile={false}
        />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-r-slate-800">
          <Sidebar isMobile={true} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setIsMobileMenuOpen(true)}
          title={getPageTitle()}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
