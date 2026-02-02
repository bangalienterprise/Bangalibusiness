
import React from 'react';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeletons';

const MetricCard = ({ title, value, icon: Icon, colorClass, loading }) => (
  <Card className="bg-slate-800 border-slate-700">
    <CardContent className="p-6">
      {loading ? (
        <div className="space-y-2">
            <Skeleton className="h-4 w-[100px] bg-slate-700" />
            <Skeleton className="h-8 w-[60px] bg-slate-700" />
        </div>
      ) : (
        <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-slate-400">{title}</span>
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
                <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const DashboardMetrics = ({ metrics, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard 
        title="Today's Sales" 
        value={`৳${metrics?.todaySales || 0}`} 
        icon={TrendingUp} 
        colorClass="bg-blue-500 text-blue-500" 
        loading={loading}
      />
      <MetricCard 
        title="Est. Profit" 
        value={`৳${metrics?.estProfit || 0}`} 
        icon={DollarSign} 
        colorClass="bg-emerald-500 text-emerald-500" 
        loading={loading}
      />
      <MetricCard 
        title="Total Customers" 
        value={metrics?.totalCustomers || 0} 
        icon={Users} 
        colorClass="bg-purple-500 text-purple-500" 
        loading={loading}
      />
      <MetricCard 
        title="Stock Alerts" 
        value={metrics?.stockAlerts || 0} 
        icon={AlertTriangle} 
        colorClass="bg-red-500 text-red-500" 
        loading={loading}
      />
    </div>
  );
};

export default DashboardMetrics;
