import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, Activity, Database } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">System Administration</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">56</div>
                        <p className="text-xs text-muted-foreground">+3 new this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">99.9%</div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Database</CardTitle>
                        <Database className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Healthy</div>
                        <p className="text-xs text-muted-foreground">Backups active</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Recent Registrations</CardTitle></CardHeader>
                    <CardContent><p>List of recent users...</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>System Logs</CardTitle></CardHeader>
                    <CardContent><p>Recent activity logs...</p></CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;