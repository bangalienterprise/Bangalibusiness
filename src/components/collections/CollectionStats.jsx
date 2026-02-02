import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Coins, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CollectionStats = ({ collections, dateRange }) => {
    
    const stats = useMemo(() => {
        const filtered = collections.filter(c => {
            if (!dateRange?.from || !dateRange?.to) return true;
            const date = parseISO(c.collection_date);
            return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
        });

        const totalCollected = filtered.reduce((sum, c) => sum + Number(c.amount_collected), 0);
        const count = filtered.length;
        const avg = count > 0 ? totalCollected / count : 0;

        // Method breakdown
        const byMethod = filtered.reduce((acc, c) => {
            acc[c.payment_method] = (acc[c.payment_method] || 0) + Number(c.amount_collected);
            return acc;
        }, {});
        const methodData = Object.keys(byMethod).map(k => ({ name: k.replace('_', ' '), value: byMethod[k] }));

        // Daily breakdown for chart
        const byDate = filtered.reduce((acc, c) => {
            const date = format(parseISO(c.collection_date), 'MMM dd');
            acc[date] = (acc[date] || 0) + Number(c.amount_collected);
            return acc;
        }, {});
        const chartData = Object.keys(byDate).map(k => ({ date: k, amount: byDate[k] }));

        return { totalCollected, count, avg, methodData, chartData };
    }, [collections, dateRange]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.totalCollected.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In selected period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.count}</div>
                        <p className="text-xs text-muted-foreground">Total payments received</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">Average per payment</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Collection Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                                    formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']}
                                />
                                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.methodData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.methodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `৳${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CollectionStats;