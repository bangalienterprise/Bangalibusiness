import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';

const ServiceProviderDashboard = () => {
  const { business } = useBusiness();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">Service Dashboard</h2>
      <p className="text-gray-400">{business?.name}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-400">Upcoming today</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-400">Total active clients</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;