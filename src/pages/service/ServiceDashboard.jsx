
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Star, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ServiceDashboard = () => {
  const { business } = useAuth();
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between">
        <h1 className="text-3xl font-bold">Service Dashboard</h1>
        <p className="text-muted-foreground">{business?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">12</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">8</div></CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">4.8</div></CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">142</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed">
            Service Revenue Chart Placeholder
        </Card>
        <Card className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed">
            Appointment Status Breakdown Placeholder
        </Card>
      </div>
    </div>
  );
};
export default ServiceDashboard;
