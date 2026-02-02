import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import KPIGrid from '@/components/dashboard/shared/KPIGrid';
import DashboardCard from '@/components/dashboard/shared/DashboardCard';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import DashboardChart from '@/components/dashboard/shared/DashboardChart';
import DashboardTable from '@/components/dashboard/shared/DashboardTable';
import { Briefcase, DollarSign, Users, CheckCircle } from 'lucide-react';

const OwnerDashboard = () => {
    const { useStats } = useDashboardData();
    const { stats, loading } = useStats();

    // Mapping generic stats
    const monthlyRevenue = stats.revenue;
    const activeProjects = stats.orders; 

    return (
        <div className="space-y-8 pb-10">
            <SectionHeader title="Agency Overview" description="Track your projects and team performance." />
            
            <KPIGrid>
                 <DashboardCard 
                    title="Active Projects" 
                    value={activeProjects} 
                    icon={Briefcase} 
                    description="Currently in progress"
                    loading={loading}
                />
                <DashboardCard 
                    title="Monthly Revenue" 
                    value={`৳${monthlyRevenue.toLocaleString()}`} 
                    icon={DollarSign}
                    description="Total revenue this month"
                    loading={loading}
                />
                 <DashboardCard 
                    title="Key Clients" 
                    value="--" 
                    icon={Users} 
                    description="Top performing clients"
                    loading={loading}
                />
                 <DashboardCard 
                    title="Team Workload" 
                    value="--" 
                    icon={CheckCircle} 
                    description="Avg tasks per member"
                    loading={loading}
                />
            </KPIGrid>

            <div className="grid gap-6 md:grid-cols-2">
                 <DashboardChart 
                    title="Project Progress" 
                    data={[]} 
                    type="bar" 
                    loading={loading}
                    emptyMessage="No active projects to track."
                />
                <DashboardChart 
                    title="Income Trend" 
                    data={[]} 
                    type="line" 
                    loading={loading}
                    emptyMessage="Financial data will appear here."
                />
            </div>

             <DashboardTable 
                title="Recent Projects"
                headers={['Project', 'Client', 'Deadline', 'Status']}
                loading={loading}
                emptyMessage="No projects created yet."
            />
        </div>
    );
};

export default OwnerDashboard;