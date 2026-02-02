import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus } from 'lucide-react';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const OrderManagement = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const loadOrders = async () => {
            if (user?.business_id) {
                // Fetch sales as orders for now, or a separate orders collection
                const data = await mockDatabase.getAll('sales', user.business_id);
                setOrders(data || []);
            }
        };
        loadOrders();
    }, [user]);

    return (
        <div className="space-y-6">
            <Helmet><title>Orders</title></Helmet>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Orders</h1>
                <Button className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4"/> New Order</Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-violet-500"/> Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No orders found.</TableCell></TableRow>
                            ) : (
                                orders.map(order => (
                                    <TableRow key={order.id} className="border-slate-800">
                                        <TableCell className="text-white">{format(new Date(order.created_at), 'MMM dd HH:mm')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">{order.status || 'Completed'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-300 text-sm">{order.items?.length || 0} items</TableCell>
                                        <TableCell className="text-right font-medium text-white">৳{order.total}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderManagement;