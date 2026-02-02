import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign } from 'lucide-react';

const FreelancerDashboard = () => {
  const { business } = useBusiness();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">Freelancer Dashboard</h2>
      <p className="text-gray-400">Welcome back, {business?.name}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-gray-400">This week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-gray-400">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerDashboard;