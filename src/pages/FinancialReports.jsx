import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/contexts/BusinessContext';
import { useApi } from '@/hooks/useApi';
import { ApiService } from '@/services/ApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FinancialReports = () => {
  const { activeBusiness } = useBusiness();
  
  // Example of using useApi for reports
  const { data: stats, loading } = useApi(
    () => ApiService.reports.getFinancials(activeBusiness?.id),
    [activeBusiness?.id],
    { immediate: !!activeBusiness }
  );

  return (
    <div className="space-y-6">
      <Helmet><title>Reports - Bangali Enterprise</title></Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">৳{stats?.total_revenue || '0.00'}</div></CardContent>
         </Card>
         <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Net Profit</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">৳{stats?.total_profit || '0.00'}</div></CardContent>
         </Card>
         <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Products Sold</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.products_sold || '0'}</div></CardContent>
         </Card>
      </div>
      
      {loading && <div className="py-10 text-center">Loading reports...</div>}
    </div>
  );
};

export default FinancialReports;