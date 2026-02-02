import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import KPIGrid from '@/components/dashboard/shared/KPIGrid';
import DashboardCard from '@/components/dashboard/shared/DashboardCard';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import DashboardChart from '@/components/dashboard/shared/DashboardChart';
import DashboardTable from '@/components/dashboard/shared/DashboardTable';
import { Calendar, DollarSign, Users, Briefcase } from 'lucide-react';

const OwnerDashboard = () => {
    // Reusing the generic data hook for now as logic must remain unchanged
    const { useOrders, useStats } = useDashboardData();
    const { stats, loading } = useStats();
    
    // Mapping generic data to service context
    const revenueThisWeek = stats.revenue;
    const upcomingAppointments = stats.orders; 
    const activeClients = 0; // Placeholder until hook expansion
    const servicesCount = 0; // Placeholder

    return (
        <div className="space-y-8 pb-10">
            <SectionHeader title="Service Overview" description="Manage your appointments and services." />
            
            <KPIGrid>
                <DashboardCard 
                    title="Upcoming Appointments" 
                    value={upcomingAppointments} 
                    icon={Calendar} 
                    description="Scheduled for next 7 days"
                    loading={loading}
                />
                <DashboardCard 
                    title="Revenue This Week" 
                    value={`৳${revenueThisWeek.toLocaleString()}`} 
                    icon={DollarSign}
                    description="Total earnings this week"
                    loading={loading}
                />
                <DashboardCard 
                    title="Active Clients" 
                    value={activeClients} 
                    icon={Users}
                    description="Clients with bookings"
                    loading={loading}
                />
                <DashboardCard 
                    title="Services Offered" 
                    value={servicesCount} 
                    icon={Briefcase}
                    description="Total available services"
                    loading={loading}
                />
            </KPIGrid>

            <div className="grid gap-6 md:grid-cols-2">
                <DashboardChart 
                    title="Bookings by Day" 
                    data={[]} 
                    type="bar" 
                    loading={loading}
                    emptyMessage="No bookings recorded yet."
                />
                 <DashboardChart 
                    title="Revenue Trends" 
                    data={[]} 
                    type="line" 
                    loading={loading}
                    emptyMessage="Revenue data will appear here."
                />
            </div>

            <DashboardTable 
                title="Upcoming Schedule"
                headers={['Time', 'Client', 'Service', 'Status']}
                loading={loading}
                emptyMessage="No upcoming appointments."
            />
        </div>
    );
};

export default OwnerDashboard;