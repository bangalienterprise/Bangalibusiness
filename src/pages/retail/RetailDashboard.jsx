
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Users, FileText, TrendingUp, AlertTriangle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

const QuickAction = ({ icon: Icon, label, path, color, subText, onClick }) => (
  <Button 
    variant="outline" 
    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-all bg-[#1e293b] border-slate-700 text-slate-200"
    onClick={onClick}
  >
    <Icon className={`h-6 w-6 ${color}`} />
    <div className="flex flex-col items-center">
      <span className="font-semibold">{label}</span>
      {subText && <span className="text-[10px] text-slate-400 font-normal">{subText}</span>}
    </div>
  </Button>
);

const RetailDashboardContent = () => {
  const { user, business, isOwner, isManager } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (business?.id) loadData();
  }, [business?.id]);

  const loadData = async () => {
    try {
      const data = await dashboardService.getRetailMetrics(business.id);
      setMetrics(data);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="text-red-400 p-4">Failed to load dashboard data. Please try refreshing.</div>;
  if (!metrics) return <div className="text-slate-400 p-4">No data available.</div>;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1e293b] border-slate-700 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{metrics.todaySales?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        {(isOwner() || isManager()) && (
        <Card className="bg-[#1e293b] border-slate-700 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Est. Profit</CardTitle>
            <div className="h-4 w-4 text-green-500 font-bold">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{metrics.profitEstimate?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        )}

        <Card className="bg-[#1e293b] border-slate-700 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-slate-700 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Stock Alerts</CardTitle>
            <AlertTriangle className={metrics.stockAlerts > 0 ? "h-4 w-4 text-red-500 animate-pulse" : "h-4 w-4 text-slate-500"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.stockAlerts || 0}</div>
            <p className="text-xs text-slate-400 mt-1">{metrics.outOfStock || 0} out of stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickAction icon={ShoppingCart} label="POS" onClick={() => navigate('/retail/pos')} color="text-blue-500" />
            <QuickAction icon={Package} label="Products" onClick={() => navigate('/retail/products')} color="text-green-500" />
            <QuickAction icon={FileText} label="History" onClick={() => navigate('/retail/sales-history')} color="text-purple-500" />
            <QuickAction icon={Users} label="Customers" onClick={() => navigate('/retail/due-collection')} color="text-orange-500" />
            {(isOwner() || isManager()) && <QuickAction icon={Users} label="Team" onClick={() => navigate('/retail/team')} color="text-pink-500" />}
            {isOwner() && <QuickAction icon={Settings} label="Settings" onClick={() => navigate('/retail/settings')} color="text-slate-400" />}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales Trend */}
        <Card className="col-span-2 bg-[#1e293b] border-slate-700 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.salesTrend || []}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Health Pie Chart */}
        <Card className="bg-[#1e293b] border-slate-700 text-white shadow-lg">
           <CardHeader>
             <CardTitle className="text-lg">Inventory Status</CardTitle>
           </CardHeader>
           <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={metrics.inventoryHealth || []}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {(metrics.inventoryHealth || []).map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.fill} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
               </PieChart>
             </ResponsiveContainer>
             <div className="flex justify-center gap-4 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>OK</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Low</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Out</div>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RetailDashboard = () => (
    <ErrorBoundary>
        <RetailDashboardContent />
    </ErrorBoundary>
);

export default RetailDashboard;
