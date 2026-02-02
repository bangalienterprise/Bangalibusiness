import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Filter, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/useApi';
import { ApiService } from '@/services/ApiService';
import SuspenseLoader from '@/components/SuspenseLoader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const CollectionManagement = () => {
  const { data: collections, loading } = useApi(() => ApiService.get('collections'), [], { immediate: true });
  
  if (loading && !collections) return <SuspenseLoader />;

  const totalCollected = collections?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      <Helmet><title>Collections - Bangali Enterprise</title></Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Wallet className="h-8 w-8 text-green-500" /> Payment Collections</h1>
        <Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" /> New Collection</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-900/10 border-green-900/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-500">Total Collected</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-green-400">৳{totalCollected.toLocaleString()}</div></CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold">৳{(totalCollected * 0.4).toLocaleString()}</div></CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold text-orange-400">12</div></CardContent>
          </Card>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
              <TableHeader className="bg-slate-900/50">
                  <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {collections?.map(col => (
                      <TableRow key={col.id} className="hover:bg-slate-800/50">
                          <TableCell className="font-mono text-xs text-muted-foreground">{col.reference}</TableCell>
                          <TableCell>{format(new Date(col.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>Customer {col.customer_id}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{col.method}</Badge></TableCell>
                          <TableCell className="text-right font-bold text-green-400">+৳{col.amount.toLocaleString()}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>
    </div>
  );
};

export default CollectionManagement;