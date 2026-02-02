import React from 'react';
import { Helmet } from 'react-helmet';
import { Wrench, Calendar, Clock, UserCheck } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ServiceDashboard = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Service Dashboard</title></Helmet>
            <h1 className="text-3xl font-bold text-white mb-6">Service Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Today's Appointments" value="8" icon={Calendar} trend="+2 vs yest" color="blue" />
                <StatsCard title="Available Slots" value="4" icon={Clock} color="green" />
                <StatsCard title="Technicians Active" value="5" icon={UserCheck} color="purple" />
                <StatsCard title="Services Completed" value="124" icon={Wrench} trend="Monthly" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Appointment Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { time: "09:00 AM", customer: "Mr. Hasan", service: "AC Repair", tech: "Technician A", status: "In Progress" },
                                { time: "11:00 AM", customer: "Mrs. Akhter", service: "Plumbing", tech: "Technician B", status: "Scheduled" },
                                { time: "02:00 PM", customer: "Office HQ", service: "Electric Wiring", tech: "Technician A", status: "Scheduled" },
                                { time: "04:30 PM", customer: "Shop 12", service: "CCTV Install", tech: "Technician C", status: "Pending" },
                            ].map((appt, i) => (
                                <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                                    <div className="flex gap-4 items-center">
                                        <div className="font-mono text-blue-400 font-bold">{appt.time}</div>
                                        <div>
                                            <p className="font-bold">{appt.customer}</p>
                                            <p className="text-xs text-slate-500">{appt.service} • {appt.tech}</p>
                                        </div>
                                    </div>
                                    <Badge variant={appt.status === 'In Progress' ? 'default' : 'secondary'} className={appt.status === 'In Progress' ? 'bg-blue-600' : ''}>
                                        {appt.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Technician Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: "Technician A", status: "Busy", job: "AC Repair @ Hasan" },
                            { name: "Technician B", status: "Available", job: "Waiting..." },
                            { name: "Technician C", status: "Break", job: "Back in 15m" },
                        ].map((tech, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{tech.name}</p>
                                    <p className="text-xs text-slate-500">{tech.job}</p>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${tech.status === 'Available' ? 'bg-green-500' : tech.status === 'Busy' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            </div>
                        ))}
                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500">Assign New Job</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ServiceDashboard;