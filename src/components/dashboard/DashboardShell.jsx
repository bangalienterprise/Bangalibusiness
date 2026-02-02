import React from 'react';
import Header from '@/components/layouts/Header';
import Sidebar from '@/components/layouts/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

const DashboardShell = ({ children }) => {
  const { user } = useAuth();
  const { business } = useBusiness();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-primary/30">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={user?.role} 
        businessType={business?.business_type} 
      />
      
      <div className="flex flex-1 flex-col transition-all duration-300 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;