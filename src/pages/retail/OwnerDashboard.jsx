
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
    AlertTriangle, Package, CreditCard, Activity, ArrowRight, 
    Plus, FileText, Settings, BarChart3, Truck, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsCard from '@/components/dashboard/StatsCard'; 
import DashboardChart from '@/components/dashboard/shared/DashboardChart'; 
import { isRLSError } from '@/utils/errorHandler';

// Reusable Quick Action Button
const QuickActionBtn = ({ icon: Icon, label, to, color = "blue" }) => (
    <Link to={to} className="w-full">
        <div className={`flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-${color}-500 hover:bg-slate-750 transition-all duration-200 group h-full shadow-lg`}>
            <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-400 mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="font-semibold text-white">{label}</span>
        </div>
    </Link>
);

const OwnerDashboard = () => {
    const { user, business } = useAuth();
    const { getCurrency } = useSettings();
    const currency = getCurrency();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (business?.id) {
                try {
                    setLoading(true);
                    // Mocking complex data fetching or using service
                    // For now, we use mock data directly to avoid RLS issues in this specific view if service fails
                    // In a real app, this would call dashboardService
                    
                    setStats({
                        todaySales: 0,
                        todayProfit: 0,
                        totalDue: 0,
                        totalCustomers: 0,
                        lowStock: 0,
                        outOfStock: 0,
                        recentActivity: []
                    });
                    
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadDashboardData();
    }, [business]);

    if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

    return (
        <div className="space-y-8 pb-10">
            <Helmet><title>Dashboard | Retail Store</title></Helmet>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-700 text-slate-300">
                        <FileText className="mr-2 h-4 w-4" /> Reports
                    </Button>
                    <Link to="/retail/pos">
                        <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Start Sale
                        </Button>
                    </Link>
                </div>
            </div>

            {/* SECTION 1: LIVE TICKER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Today's Sales</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{currency}{stats?.todaySales.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-400">
                            <TrendingUp className="h-3 w-3 mr-1" /> +0% from yesterday
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Today's Profit</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{currency}{stats?.todayProfit.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-400">
                            <TrendingUp className="h-3 w-3 mr-1" /> +0% from yesterday
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Due</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{currency}{stats?.totalDue.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-orange-400" />
                            </div>
                        </div>
                         <div className="mt-4 flex items-center text-xs text-slate-400">
                            0 customers pending
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Customers</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalCustomers}</h3>
                            </div>
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Users className="h-5 w-5 text-purple-400" />
                            </div>
                        </div>
                         <div className="mt-4 flex items-center text-xs text-green-400">
                            <Plus className="h-3 w-3 mr-1" /> 0 new today
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SECTION 2: QUICK ACTIONS */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <QuickActionBtn icon={ShoppingCart} label="Start Sale" to="/retail/pos" color="blue" />
                    <QuickActionBtn icon={Package} label="Add Product" to="/retail/stock" color="emerald" />
                    <QuickActionBtn icon={ClipboardList} label="Orders" to="/retail/orders" color="violet" />
                    <QuickActionBtn icon={TrendingDown} label="Add Expense" to="/retail/expenses" color="rose" />
                    <QuickActionBtn icon={Users} label="Team" to="/retail/team" color="amber" />
                    <QuickActionBtn icon={Settings} label="Settings" to="/retail/settings" color="slate" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SECTION 4: SALES PERFORMANCE (Dummy Chart Placeholder) */}
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" /> Sales Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-800 bg-slate-900/50">
                        <p className="text-slate-500">Chart Visualization Placeholder</p>
                    </CardContent>
                </Card>

                {/* SECTION 5: INVENTORY HEALTH */}
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-red-500" /> Stock Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
                            <span className="text-red-400 font-medium flex items-center"><AlertTriangle className="h-4 w-4 mr-2"/> Out of Stock</span>
                            <span className="text-2xl font-bold text-red-500">{stats?.outOfStock}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-900/10 border border-orange-900/20 rounded-lg">
                            <span className="text-orange-400 font-medium flex items-center"><Package className="h-4 w-4 mr-2"/> Low Stock</span>
                            <span className="text-2xl font-bold text-orange-500">{stats?.lowStock}</span>
                        </div>
                        <div className="pt-4 mt-2 border-t border-slate-800">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Total Products</span>
                                <span className="text-white font-medium">{stats?.productsCount || 0}</span>
                            </div>
                            <Link to="/retail/stock" className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-end">
                                Manage Inventory <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* SECTION 7: RECENT ACTIVITY */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-slate-400" /> Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                                <div className={`mt-1 p-2 rounded-full ${
                                    activity.type === 'sale' ? 'bg-green-500/10 text-green-400' : 
                                    activity.type === 'stock' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-400'
                                }`}>
                                    {activity.type === 'sale' ? <DollarSign className="h-3 w-3" /> : 
                                     activity.type === 'stock' ? <AlertTriangle className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{activity.msg}</p>
                                    <p className="text-xs text-slate-500">{activity.time}</p>
                                </div>
                                {activity.amount && (
                                    <span className="text-sm font-semibold text-slate-300">
                                        {currency}{activity.amount}
                                    </span>
                                )}
                            </div>
                        )) : <p className="text-slate-500 text-sm">No recent activity</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OwnerDashboard;
