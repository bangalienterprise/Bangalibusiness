
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ManufacturingDashboard = () => {
    const { user, business } = useAuth();

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white">Manufacturing Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user?.email}</p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-800 text-white border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Production Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
                <p className="text-slate-500">Manufacturing specific modules coming soon...</p>
            </div>
        </div>
    );
};

export default ManufacturingDashboard;
