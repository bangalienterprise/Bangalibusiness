import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, lowStock: 0 });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            // In a real app, these would be filtered by the owner's business_id
            // Assuming business_id is linked via RLS policies or we'd need to fetch business first
            const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
            
            if (business) {
                const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
                const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
                const { data: products } = await supabase.from('products').select('stock_quantity').eq('business_id', business.id).lt('stock_quantity', 10);
                
                // Revenue calc (simple sum)
                const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('business_id', business.id).eq('status', 'completed');
                const totalRev = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

                setStats({
                    revenue: totalRev,
                    orders: orderCount || 0,
                    customers: customerCount || 0,
                    lowStock: products?.length || 0
                });

                const { data: orders } = await supabase.from('orders').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5);
                setRecentOrders(orders || []);
            }
        };

        if (user) fetchStats();
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.orders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStock}</div>
                        <p className="text-xs text-muted-foreground">Products need attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">৳{order.total_amount}</p>
                                        <span className="text-xs uppercase bg-slate-100 px-2 py-1 rounded">{order.status}</span>
                                    </div>
                                </div>
                            ))}
                            {recentOrders.length === 0 && <p className="text-muted-foreground">No recent orders.</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <button className="w-full p-2 bg-blue-50 text-blue-600 rounded text-left font-medium hover:bg-blue-100">Add New Product</button>
                            <button className="w-full p-2 bg-green-50 text-green-600 rounded text-left font-medium hover:bg-green-100">Create Order</button>
                            <button className="w-full p-2 bg-purple-50 text-purple-600 rounded text-left font-medium hover:bg-purple-100">Add Customer</button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OwnerDashboard;