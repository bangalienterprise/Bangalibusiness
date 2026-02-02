import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
    const data = [
        { name: 'Jan', users: 400, revenue: 2400 },
        { name: 'Feb', users: 300, revenue: 1398 },
        { name: 'Mar', users: 200, revenue: 9800 },
        { name: 'Apr', users: 278, revenue: 3908 },
        { name: 'May', users: 189, revenue: 4800 },
        { name: 'Jun', users: 239, revenue: 3800 },
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Analytics - Admin - Bangali Enterprise</title>
            </Helmet>
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Analytics</h1>
                <p className="text-muted-foreground">Key performance indicators for the entire system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">1,234</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Businesses</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">56</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">৳1.2M</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Server Uptime</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">99.9%</div></CardContent>
                </Card>
            </div>

            <Card className="h-96">
                <CardHeader>
                    <CardTitle>Growth Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-full pb-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
                            <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsPage;