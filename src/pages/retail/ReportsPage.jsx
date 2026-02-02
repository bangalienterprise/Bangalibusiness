
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, subDays } from 'date-fns';

const ReportsPage = () => {
    const { business } = useAuth();
    const [salesData, setSalesData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (business?.id) fetchReportData();
    }, [business]);

    const fetchReportData = async () => {
        setLoading(true);
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        
        try {
            const [salesRes, expenseRes] = await Promise.all([
                supabase.from('sales_transactions')
                    .select('created_at, total_amount, profit')
                    .eq('business_id', business.id)
                    .gte('created_at', thirtyDaysAgo)
                    .order('created_at'),
                supabase.from('expenses')
                    .select('date, amount, category')
                    .eq('business_id', business.id)
                    .gte('date', thirtyDaysAgo)
                    .order('date')
            ]);

            // Process Sales Data
            const salesMap = {};
            (salesRes.data || []).forEach(s => {
                const date = format(new Date(s.created_at), 'MMM dd');
                if (!salesMap[date]) salesMap[date] = { date, sales: 0, profit: 0 };
                salesMap[date].sales += Number(s.total_amount);
                salesMap[date].profit += Number(s.profit);
            });
            setSalesData(Object.values(salesMap));

            // Process Expense Data
            const expenseMap = {};
             (expenseRes.data || []).forEach(e => {
                const date = format(new Date(e.date), 'MMM dd');
                if (!expenseMap[date]) expenseMap[date] = { date, amount: 0 };
                expenseMap[date].amount += Number(e.amount);
            });
            setExpenseData(Object.values(expenseMap));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalSales = salesData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalProfit = salesData.reduce((acc, curr) => acc + curr.profit, 0);
    const totalExpenses = expenseData.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Reports - Bangali Enterprise</title></Helmet>
            
            <h1 className="text-3xl font-bold text-white">Business Reports</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Sales (30d)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">৳{totalSales.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Profit (30d)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">৳{totalProfit.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Expenses (30d)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">৳{totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="sales" className="space-y-4">
                <TabsList className="bg-slate-800 text-slate-400">
                    <TabsTrigger value="sales">Sales & Profit</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>

                <TabsContent value="sales">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-white">Revenue Trend</CardTitle></CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                                    <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-white">Expense Trend</CardTitle></CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expenseData}>
                                    <XAxis dataKey="date" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                    <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReportsPage;
