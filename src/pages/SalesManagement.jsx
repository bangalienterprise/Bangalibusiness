import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/contexts/BusinessContext';
import { useApi } from '@/hooks/useApi';
import { ApiService } from '@/services/ApiService';
import SuspenseLoader from '@/components/SuspenseLoader';
import MultiStepSalesDialog from '@/components/sales/MultiStepSalesDialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

const SalesManagement = () => {
  const { activeBusiness } = useBusiness();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sales, loading, execute: reloadSales } = useApi(
    () => ApiService.sales.list(activeBusiness?.id),
    [activeBusiness?.id],
    { immediate: !!activeBusiness }
  );

  if (loading && !sales) return <SuspenseLoader />;

  return (
    <div className="space-y-6">
      <Helmet><title>Sales - Bangali Enterprise</title></Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Transactions</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Sale</Button>
      </div>

      <div className="space-y-4">
        {sales?.map(sale => (
            <Card key={sale.id}>
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{format(new Date(sale.sale_date), 'PPP')}</p>
                        <p className="text-sm text-gray-500">ID: {sale.id.substring(0,8)}</p>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-lg">৳{sale.final_amount}</p>
                         <p className="text-xs text-gray-500 capitalize">{sale.payment_method}</p>
                    </div>
                </CardContent>
            </Card>
        ))}
         {sales?.length === 0 && <div className="text-center py-10 text-muted-foreground">No sales recorded yet.</div>}
      </div>

      <MultiStepSalesDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={reloadSales} />
    </div>
  );
};

export default SalesManagement;