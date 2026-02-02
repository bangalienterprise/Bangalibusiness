import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import KPIGrid from '@/components/dashboard/shared/KPIGrid';
import DashboardCard from '@/components/dashboard/shared/DashboardCard';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import { DollarSign, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SellerDashboard = () => {
    const { useStats } = useDashboardData();
    const { stats, loading } = useStats();

    return (
        <div className="space-y-8 pb-10">
            <SectionHeader title="My Sales Dashboard" description="Track your personal sales and targets." />
            
            <KPIGrid>
                <DashboardCard 
                    title="My Sales Today" 
                    value={`৳${(stats.revenue || 0).toLocaleString()}`} 
                    icon={DollarSign} 
                    description="Total revenue generated"
                    loading={loading}
                />
                 <DashboardCard 
                    title="Transactions" 
                    value={stats.orders} 
                    icon={Target} 
                    description="Successful sales"
                    loading={loading}
                />
                 <DashboardCard 
                    title="Commission (Est.)" 
                    value={`৳${((stats.revenue || 0) * 0.05).toLocaleString()}`} 
                    icon={Award} 
                    description="Based on 5% rate"
                    loading={loading}
                />
            </KPIGrid>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-[2rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full h-12 rounded-xl text-lg font-bold" size="lg">New Sale</Button>
                        <Button variant="outline" className="w-full h-12 rounded-xl">View Customer History</Button>
                    </CardContent>
                </Card>
                
                <Card className="rounded-[2rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-sm">No recent sales recorded today.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SellerDashboard;