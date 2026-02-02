import React from 'react';
import { Helmet } from 'react-helmet';
import { DollarSign, Briefcase, Clock, FileText } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const FreelancerDashboard = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Freelancer Dashboard</title></Helmet>
            <h1 className="text-3xl font-bold text-white mb-6">Freelancer Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Earnings" value="৳154k" icon={DollarSign} trend="+20% this mo" color="green" />
                <StatsCard title="Active Projects" value="3" icon={Briefcase} color="blue" />
                <StatsCard title="Hours Logged" value="126h" icon={Clock} trend="This month" color="purple" />
                <StatsCard title="Pending Invoices" value="2" icon={FileText} trend="৳25k due" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Active Projects</CardTitle>
                        <Button size="sm" variant="outline" className="border-slate-700">Add Project</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { name: "E-commerce Website", client: "FashionStore", progress: 75, due: "2 days" },
                            { name: "Logo Redesign", client: "TechStartup", progress: 30, due: "1 week" },
                            { name: "API Integration", client: "ServiceApp", progress: 90, due: "Tomorrow" },
                        ].map((proj, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{proj.name}</p>
                                        <p className="text-xs text-slate-400">{proj.client}</p>
                                    </div>
                                    <span className="text-xs text-blue-400 font-mono">Due in {proj.due}</span>
                                </div>
                                <Progress value={proj.progress} className="h-2 bg-slate-800" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Quick Invoice</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center space-y-3">
                            <FileText className="h-10 w-10 text-slate-500 mx-auto" />
                            <p className="text-sm text-slate-400">Create a professional invoice in seconds.</p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-500">Create New Invoice</Button>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-800">
                             <h4 className="text-sm font-bold mb-3 text-slate-400">Recent Invoices</h4>
                             <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>INV-0023</span>
                                    <span className="text-orange-400">Pending</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>INV-0022</span>
                                    <span className="text-green-400">Paid</span>
                                </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FreelancerDashboard;