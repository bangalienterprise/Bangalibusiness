
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

const OrdersPage = () => {
    const { business } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (business?.id) fetchOrders();
    }, [business]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch sales transactions as "Orders"
            const { data, error } = await supabase
                .from('sales_transactions')
                .select(`
                    *,
                    customer:customers(name, phone),
                    seller:profiles!sales_transactions_sold_by_fkey(full_name)
                `)
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => 
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Orders - Bangali Enterprise</title></Helmet>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Order Management</h1>
                    <p className="text-slate-400">Track and manage your sales orders.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <Search className="h-5 w-5 text-slate-400" />
                <Input 
                    placeholder="Search by Order ID or Customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-slate-500"
                />
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Order ID</TableHead>
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Customer</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Payment</TableHead>
                            <TableHead className="text-right text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No orders found</TableCell></TableRow>
                        ) : (
                            filteredOrders.map(order => (
                                <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</TableCell>
                                    <TableCell className="text-slate-300 text-sm">
                                        {format(new Date(order.created_at), 'MMM d, h:mm a')}
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{order.customer?.name || 'Walk-in'}</TableCell>
                                    <TableCell className="text-white">৳{order.total_amount}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.paid_amount >= order.total_amount ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {order.paid_amount >= order.total_amount ? 'Paid' : 'Partial'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs">Completed</span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default OrdersPage;
