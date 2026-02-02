import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const DataExportPage = () => {
  return (
    <>
      <Helmet><title>Data Export</title></Helmet>
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Data Export</h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            {['Sales Data', 'Customer List', 'Inventory Report', 'Expense History'].map(type => (
              <Card key={type} className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                  <CardTitle>{type}</CardTitle>
                  <CardDescription className="text-gray-400">Download your {type.toLowerCase()} as CSV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    </>
  );
};

export default DataExportPage;