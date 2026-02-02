import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const MyCommissionPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const load = async () => {
            if (user) {
                const sales = await mockDatabase.getCommissionHistory(user.id);
                setHistory(sales || []);
                const total = sales.reduce((sum, s) => sum + (s.commission_amount || 0), 0);
                setStats({ total, pending: 0, paid: total }); // Simplified
            }
        };
        load();
    }, [user]);

    return (
        <div className="space-y-6">
            <Helmet><title>My Commission</title></Helmet>
            
            <h1 className="text-3xl font-bold text-white">My Commission</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Earned</p>
                            <p className="text-2xl font-bold text-white">৳{stats.total.toFixed(2)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500 opacity-50"/>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6 flex items-center justify-between">
                         <div>
                            <p className="text-sm text-slate-400">This Month</p>
                            <p className="text-2xl font-bold text-white">৳{stats.total.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500 opacity-50"/>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead>Date</TableHead>
                                <TableHead>Sale Total</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center text-slate-500">No history found.</TableCell></TableRow>
                            ) : (
                                history.map(h => (
                                    <TableRow key={h.id} className="border-slate-800">
                                        <TableCell className="text-white">{format(new Date(h.created_at), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="text-slate-300">৳{h.total_amount}</TableCell>
                                        <TableCell className="text-slate-400">{h.commission_percentage}%</TableCell>
                                        <TableCell className="text-right font-medium text-green-400">৳{h.commission_amount}</TableCell>
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

export default MyCommissionPage;