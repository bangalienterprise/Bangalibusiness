
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Database, Shield } from 'lucide-react';

const SystemPage = () => {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">System Health</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database</CardTitle>
                        <Database className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Connected</div>
                        <p className="text-xs text-muted-foreground">Supabase connection active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Security</CardTitle>
                        <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RLS Enabled</div>
                        <p className="text-xs text-muted-foreground">Row Level Security active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Services</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Operational</div>
                        <p className="text-xs text-muted-foreground">All systems go</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4">
                <Button>Run Health Check</Button>
                <Button variant="outline">View Logs</Button>
            </div>
        </div>
    );
};

export default SystemPage;
