import React from 'react';
import { Helmet } from 'react-helmet';
import { LayoutDashboard, Briefcase, Users, CheckCircle, Clock } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AgencyDashboard = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Agency Dashboard</title></Helmet>
            
            <h1 className="text-3xl font-bold text-white mb-6">Agency Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Active Projects" value="12" icon={Briefcase} trend="+2 this month" color="blue" />
                <StatsCard title="Total Clients" value="28" icon={Users} trend="+3 new" color="purple" />
                <StatsCard title="Completed" value="45" icon={CheckCircle} color="green" />
                <StatsCard title="Pending Tasks" value="34" icon={Clock} trend="8 urgent" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Project Board</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 h-96">
                            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-3 text-slate-400 text-xs uppercase tracking-wider">In Progress</h3>
                                <div className="space-y-2">
                                    <div className="bg-slate-800 p-3 rounded shadow-sm border border-slate-700">
                                        <p className="font-medium text-sm">Website Redesign</p>
                                        <p className="text-xs text-slate-500 mt-1">Client: TechCorp</p>
                                        <Badge className="mt-2 text-[10px] bg-blue-900/30 text-blue-400">Due in 2 days</Badge>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded shadow-sm border border-slate-700">
                                        <p className="font-medium text-sm">SEO Audit</p>
                                        <p className="text-xs text-slate-500 mt-1">Client: FreshFoods</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-3 text-slate-400 text-xs uppercase tracking-wider">Review</h3>
                                <div className="space-y-2">
                                    <div className="bg-slate-800 p-3 rounded shadow-sm border border-slate-700">
                                        <p className="font-medium text-sm">Mobile App UI</p>
                                        <p className="text-xs text-slate-500 mt-1">Client: StartUp Inc</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-3 text-slate-400 text-xs uppercase tracking-wider">Done</h3>
                                <div className="space-y-2">
                                    <div className="bg-slate-800 p-3 rounded shadow-sm border border-slate-700 opacity-75">
                                        <p className="font-medium text-sm line-through text-slate-500">Logo Design</p>
                                        <p className="text-xs text-slate-600 mt-1">Client: Bakery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Recent Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {['TechCorp', 'FreshFoods', 'StartUp Inc', 'Local Bakery'].map((client, i) => (
                                <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-800 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{client}</p>
                                        <p className="text-xs text-slate-500">2 Active Projects</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-green-400">৳125k</p>
                                        <p className="text-[10px] text-slate-500">Total Spent</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AgencyDashboard;