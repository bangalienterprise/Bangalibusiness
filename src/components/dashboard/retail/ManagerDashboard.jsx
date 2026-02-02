import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import KPIGrid from '@/components/dashboard/shared/KPIGrid';
import DashboardCard from '@/components/dashboard/shared/DashboardCard';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import DashboardChart from '@/components/dashboard/shared/DashboardChart';
import DashboardTable from '@/components/dashboard/shared/DashboardTable';
import { ShoppingCart, Users, Package } from 'lucide-react';

const ManagerDashboard = () => {
    const { useStats } = useDashboardData();
    const { stats, loading } = useStats();

    return (
        <div className="space-y-8 pb-10">
            <SectionHeader title="Store Management" description="Oversee daily operations and team performance." />
            
            <KPIGrid>
                <DashboardCard 
                    title="Today's Sales" 
                    value={stats.orders} 
                    icon={ShoppingCart} 
                    description="Orders processed today"
                    loading={loading}
                />
                 <DashboardCard 
                    title="Active Staff" 
                    value={stats.customers} 
                    icon={Users} 
                    description="Staff currently clocked in"
                    loading={loading}
                />
                 <DashboardCard 
                    title="Low Stock Alerts" 
                    value={stats.inventory} 
                    icon={Package} 
                    description="Items needing restock"
                    loading={loading}
                    trend="down"
                />
            </KPIGrid>

            <div className="grid gap-6 md:grid-cols-2">
                 <DashboardChart 
                    title="Weekly Sales Performance" 
                    data={[]} 
                    type="bar" 
                    loading={loading}
                    emptyMessage="No sales data available for this week."
                />
                <DashboardTable 
                    title="Pending Orders"
                    headers={['Order ID', 'Customer', 'Amount', 'Status']}
                    loading={loading}
                    emptyMessage="No pending orders."
                />
            </div>
        </div>
    );
};

export default ManagerDashboard;