
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, Laptop, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const FreelancerDashboard = () => {
    const { business } = useAuth();

  return (
    <div className="space-y-6 p-6">
       <div className="flex flex-col md:flex-row justify-between">
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        <p className="text-muted-foreground">{business?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Laptop className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">3</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours this Week</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">34h</div></CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earnings (Month)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">$4,200</div></CardContent>
        </Card>
        <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">5.0</div></CardContent>
        </Card>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed">
            Earnings Trend Chart Placeholder
        </Card>
        <Card className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 border-dashed">
            Hours Breakdown Placeholder
        </Card>
      </div>
    </div>
  );
};
export default FreelancerDashboard;
