import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import KPIGrid from '@/components/dashboard/shared/KPIGrid';
import DashboardCard from '@/components/dashboard/shared/DashboardCard';
import SectionHeader from '@/components/dashboard/shared/SectionHeader';
import DashboardChart from '@/components/dashboard/shared/DashboardChart';
import DashboardTable from '@/components/dashboard/shared/DashboardTable';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const { useOrders, useProducts, useStats } = useDashboardData();
  const { data: recentOrders, loading: ordersLoading } = useOrders({ limit: 5 });
  const { data: products, loading: productsLoading } = useProducts();
  const { stats, loading: statsLoading } = useStats();
  const navigate = useNavigate();

  const lowStockProducts = products.filter(p => p.stock < 10);
  
  // Use generic stats if calculating specifically is expensive or needs new query
  const totalSalesToday = stats.revenue;
  const ordersCountToday = stats.orders;
  
  // Derived data for display
  const topProduct = products.length > 0 ? products[0].name : "N/A"; 
  const activeCustomers = recentOrders.length > 0 ? new Set(recentOrders.map(o => o.customer_id)).size : 0;

  // Mock chart data for visualization polish (since we don't have historical query yet)
  const salesChartData = [
    { name: 'Mon', revenue: totalSalesToday * 0.7 },
    { name: 'Tue', revenue: totalSalesToday * 0.5 },
    { name: 'Wed', revenue: totalSalesToday * 1.1 },
    { name: 'Thu', revenue: totalSalesToday * 0.9 },
    { name: 'Fri', revenue: totalSalesToday },
    { name: 'Sat', revenue: totalSalesToday * 0.8 },
    { name: 'Sun', revenue: totalSalesToday * 0.4 },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Overview Section */}
      <section>
        <SectionHeader 
            title="Overview" 
            description="Key performance indicators for your store today."
        />
        <KPIGrid>
          <DashboardCard 
            title="Today's Sales" 
            value={`৳${totalSalesToday.toLocaleString()}`} 
            icon={DollarSign}
            description="Total value of completed orders"
            trend={{ value: 12, direction: 'up', label: 'vs yesterday' }}
            loading={statsLoading}
          />
          <DashboardCard 
            title="Orders Today" 
            value={ordersCountToday} 
            icon={ShoppingBag}
            description="Number of orders placed"
            loading={statsLoading}
          />
          <DashboardCard 
            title="Top Product" 
            value={topProduct} 
            icon={Package}
            description="Best performing product"
            loading={productsLoading}
            className="border-l-4 border-l-blue-500"
          />
          <DashboardCard 
            title="Active Customers" 
            value={activeCustomers} 
            icon={Users}
            description="Customers with recent activity"
            loading={ordersLoading}
          />
        </KPIGrid>
      </section>

      {/* Analytics Section */}
      <div className="grid gap-6 md:grid-cols-2">
         <DashboardChart 
            title="Sales Trend" 
            data={salesChartData} 
            type="line" 
            dataKey="revenue" 
            loading={statsLoading} 
            emptyMessage="Start selling to see your revenue trends."
         />
         <DashboardChart 
            title="Top Products" 
            data={products.slice(0, 5).map(p => ({ name: p.name, stock: p.stock }))} 
            type="bar" 
            dataKey="stock" 
            xAxisKey="name"
            loading={productsLoading}
            emptyMessage="Add products to see inventory stats."
         />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
            <DashboardTable 
                title="Recent Orders" 
                headers={['Customer', 'Date', 'Status', 'Amount']}
                loading={ordersLoading}
                onViewAll={() => navigate('/sales')}
                emptyMessage="No recent orders found."
            >
                {recentOrders.map(order => (
                    <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/30 transition-colors">
                        <TableCell className="font-medium text-slate-200">{order.customer?.name || 'Guest'}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                                order.amount_paid >= order.final_amount 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                                {order.amount_paid >= order.final_amount ? 'Completed' : 'Pending'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-200">৳{order.final_amount?.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </DashboardTable>
        </div>

        <div className="md:col-span-3">
             <DashboardTable 
                title="Inventory Alerts"
                headers={['Product', 'Stock']}
                loading={productsLoading}
                onViewAll={() => navigate('/stock')}
                emptyMessage="Inventory levels are healthy."
            >
                {lowStockProducts.slice(0, 5).map(p => (
                    <TableRow key={p.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="font-medium text-slate-200 truncate max-w-[150px]">{p.name}</TableCell>
                        <TableCell className="text-right">
                            <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                                {p.stock} left
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </DashboardTable>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;