import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Users, Package } from 'lucide-react';

const OtherOwnerDashboard = () => {
    const { business } = useBusiness();
    const category = business?.custom_category || 'General';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">{category} Dashboard</h2>
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                    Custom Business
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Generic Metrics that fit most businesses */}
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$45,231.89</div>
                        <p className="text-xs text-gray-500">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">+2350</div>
                        <p className="text-xs text-gray-500">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Operations</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">98%</div>
                        <p className="text-xs text-gray-500">Uptime / Efficiency</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Inventory/Assets</CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">1,203</div>
                        <p className="text-xs text-gray-500">Items Tracked</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="rounded-[2.5rem] border-gray-800 bg-gray-900/50 p-6 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-gray-400" />
                 </div>
                 <div>
                     <h3 className="text-xl font-bold text-white">Customize Your Dashboard</h3>
                     <p className="text-gray-400 max-w-md mt-2">
                         Since you selected "{category}", you can further customize this dashboard by adding specific widgets relevant to your industry.
                     </p>
                 </div>
                 <Button variant="outline" className="rounded-full">Configure Widgets</Button>
            </Card>
        </div>
    );
};

export default OtherOwnerDashboard;