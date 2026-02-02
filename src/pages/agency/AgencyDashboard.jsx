
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, CheckCircle, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AgencyDashboard = () => {
  const { business } = useAuth();

  return (
    <div className="space-y-6 p-6">
       <div className="flex flex-col md:flex-row justify-between">
        <h1 className="text-3xl font-bold">Agency Dashboard</h1>
        <p className="text-muted-foreground">{business?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">5</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">85%</div></CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">24</div></CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <BarChart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">$12,450</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2 h-[400px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed">
            Project Revenue Trend Chart Placeholder
        </Card>
        <Card className="h-[400px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed">
            Team Status Placeholder
        </Card>
      </div>
    </div>
  );
};
export default AgencyDashboard;
