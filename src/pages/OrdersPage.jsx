import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/useApi';
import { ApiService } from '@/services/ApiService';
import SuspenseLoader from '@/components/SuspenseLoader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const OrdersPage = () => {
  const { data: orders, loading } = useApi(() => ApiService.orders.list(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (loading) return <SuspenseLoader />;

  const filteredOrders = orders?.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status) => {
      switch(status) {
          case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
          case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
          case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
          case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
          default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <Helmet><title>Orders - Bangali Enterprise</title></Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex gap-2">
            <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10 bg-slate-900 border-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
         <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-900 border-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
         </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
              <TableHeader className="bg-slate-900/50">
                  <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredOrders.map(order => (
                      <TableRow key={order.id} className="hover:bg-slate-800/50">
                          <TableCell className="font-mono font-medium">{order.id}</TableCell>
                          <TableCell>{format(new Date(order.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell className="font-bold">৳{order.amount}</TableCell>
                          <TableCell>
                              <Badge className={`uppercase text-[10px] tracking-wider ${getStatusColor(order.status)}`}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="capitalize text-slate-400">{order.payment_status}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
          {filteredOrders.length === 0 && <div className="p-8 text-center text-muted-foreground">No orders found.</div>}
      </div>
    </div>
  );
};

export default OrdersPage;