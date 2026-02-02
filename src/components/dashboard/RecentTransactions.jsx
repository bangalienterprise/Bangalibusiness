
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeletons';

const RecentTransactions = () => {
  const { business } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business?.id) {
      fetchRecentTransactions();
    }
  }, [business]);

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .select(`
            id,
            total_amount,
            paid_amount,
            created_at,
            customer:customers(name)
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (total, paid) => {
    if (paid >= total) return { label: 'Paid', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    if (paid > 0) return { label: 'Partial', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    return { label: 'Unpaid', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  };

  return (
    <Card className="bg-slate-800 border-slate-700 mt-8">
      <CardHeader>
        <CardTitle className="text-white">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400">Customer</TableHead>
              <TableHead className="text-slate-400">Amount</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-right text-slate-400">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i} className="border-slate-700">
                    <TableCell><Skeleton className="h-4 w-24 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-slate-700" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-slate-700 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-24 bg-slate-700 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
                <TableRow className="border-slate-700">
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        No recent transactions found
                    </TableCell>
                </TableRow>
            ) : (
                transactions.map((t) => {
                    const status = getStatus(t.total_amount, t.paid_amount);
                    return (
                        <TableRow key={t.id} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="font-medium text-slate-200">
                                {t.customer?.name || 'Walk-in Customer'}
                            </TableCell>
                            <TableCell className="text-slate-200">
                                ৳{t.total_amount}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`${status.color} border font-normal`}>
                                    {status.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right text-slate-400 text-sm">
                                {format(new Date(t.created_at), 'MMM d, h:mm a')}
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
