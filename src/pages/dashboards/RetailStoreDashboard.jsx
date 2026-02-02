import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
    LayoutDashboard, TrendingUp, Users, AlertTriangle, 
    ShoppingBag, DollarSign, Package, TrendingDown, Award 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const RetailStoreDashboard = () => {
    const { user, hasPermission } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentSales, setRecentSales] = useState([]);
    
    // Permissions
    const canSeeProfit = hasPermission('CAN_SEE_PROFIT');

    useEffect(() => {
        const loadDashboard = async () => {
            if (user?.business_id) {
                const data = await mockDatabase.getRetailStats(user.business_id);
                setStats(data);
                const sales = await mockDatabase.getAll('sales', user.business_id);
                setRecentSales(sales.slice(0, 10)); // Last 10
            }
        };
        loadDashboard();
    }, [user]);

    if (!stats) return <div className="p-8 text-white">Loading dashboard...</div>;

    // Mock Chart Data
    const trendData = [
        { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 }, { name: 'Wed', sales: 5000 },
        { name: 'Thu', sales: 2780 }, { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 }, { name: 'Sun', sales: 3490 },
    ];
    
    const expenseData = [
        { name: 'Rent', value: 500 }, { name: 'Inventory', value: 1200 }, { name: 'Staff', value: 800 }, { name: 'Utils', value: 300 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <Helmet><title>Retail Dashboard</title></Helmet>

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">Retail Store Dashboard</h1>
                <div className="text-sm text-slate-400">Welcome back, {user.full_name}</div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard 
                    title="Total Revenue" 
                    value={`৳${stats.totalRevenue.toLocaleString()}`} 
                    icon={DollarSign} 
                    trend="+12%" 
                    color="blue"
                />
                {canSeeProfit && (
                    <StatsCard 
                        title="Net Profit (Est)" 
                        value={`৳${(stats.totalRevenue * 0.25).toLocaleString()}`} 
                        icon={TrendingUp} 
                        trend="+8%" 
                        color="green"
                    />
                )}
                <StatsCard 
                    title="Total Expenses" 
                    value="৳2,450" 
                    icon={TrendingDown} 
                    trend="-2%" 
                    color="red"
                />
                 <StatsCard 
                    title="Total Customers" 
                    value={stats.customersCount} 
                    icon={Users} 
                    trend="+5%" 
                    color="purple"
                />
            </div>

            {/* Middle Section: Best Performer & Top Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Award className="w-24 h-24 text-yellow-500" /></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="text-yellow-500 h-5 w-5" /> Best Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold">R</div>
                            <div>
                                <p className="font-bold text-lg">Rahim Seller</p>
                                <p className="text-slate-400 text-sm">Sales Associate</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-slate-800/50 p-2 rounded">
                                <p className="text-xs text-slate-400">Total Sales</p>
                                <p className="font-bold text-blue-400">৳45,200</p>
                            </div>
                            <div className="bg-slate-800/50 p-2 rounded">
                                <p className="text-xs text-slate-400">Transactions</p>
                                <p className="font-bold text-purple-400">142</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} 
                                    itemStyle={{ color: '#60a5fa' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Sales List */}
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentSales.map((sale, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 hover:bg-slate-800/50 p-2 rounded transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="bg-blue-900/20 p-2 rounded text-blue-500"><ShoppingBag className="h-4 w-4" /></div>
                                        <div>
                                            <p className="font-medium text-sm text-white">{sale.customer_name || 'Walk-in'}</p>
                                            <p className="text-xs text-slate-400">#{sale.id.slice(0,6)} • {new Date(sale.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-400">৳{sale.total}</p>
                                        <p className={`text-[10px] px-2 py-0.5 rounded-full inline-block ${sale.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {sale.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentSales.length === 0 && <p className="text-slate-500 text-center py-4">No recent sales.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Breakdown or Inventory Health */}
                <div className="space-y-6">
                     {canSeeProfit && (
                        <Card className="bg-slate-900 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle>Expense Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-64 flex justify-center items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                     )}
                     
                     <Card className="bg-slate-900 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Inventory Health</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="text-red-500 h-5 w-5" />
                                    <div>
                                        <p className="font-bold text-red-400">{stats.lowStock}</p>
                                        <p className="text-xs text-slate-400">Low Stock Items</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs border-red-800 text-red-400 hover:bg-red-900/20">Restock</Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Total SKUs</span>
                                <span className="text-white font-bold">{stats.productsCount}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RetailStoreDashboard;