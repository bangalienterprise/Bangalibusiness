import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GenericDashboard = () => {
    const { business } = useBusiness();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                    <p className="text-gray-400">{business?.name || 'My Business'}</p>
                </div>
                <Button onClick={() => navigate('/dashboard/setup')} variant="outline">
                    Customize Layout
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$0.00</div>
                        <p className="text-xs text-gray-500">No data available</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Customers</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-gray-500">Active profiles</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Operations</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">100%</div>
                        <p className="text-xs text-gray-500">System Status</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Inventory</CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">0</div>
                        <p className="text-xs text-gray-500">Items Tracked</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 p-8 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-gray-400" />
                 </div>
                 <div>
                     <h3 className="text-xl font-bold text-white">Welcome to your Dashboard</h3>
                     <p className="text-gray-400 max-w-md mt-2 mx-auto">
                         This is a generic view because we couldn't determine your specific business type or you have a custom setup.
                     </p>
                 </div>
                 <Button className="rounded-full bg-primary text-white hover:bg-primary/90" onClick={() => navigate('/dashboard/setup')}>
                    Setup Dashboard Widgets
                 </Button>
            </Card>
        </div>
    );
};

export default GenericDashboard;