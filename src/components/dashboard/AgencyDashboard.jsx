import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, FileText } from 'lucide-react';

const AgencyDashboard = () => {
  const { business } = useBusiness();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">Agency Dashboard</h2>
      <p className="text-gray-400">Managing {business?.name}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-400">Current active contracts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-400">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-400">Pending payment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDashboard;