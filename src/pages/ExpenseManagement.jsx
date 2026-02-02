import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/contexts/BusinessContext';
import { useApi } from '@/hooks/useApi';
import { ApiService } from '@/services/ApiService';
import SuspenseLoader from '@/components/SuspenseLoader';
import ExpenseDialog from '@/components/expenses/ExpenseDialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

const ExpenseManagement = () => {
  const { activeBusiness } = useBusiness();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: expenses, loading, execute: reloadExpenses } = useApi(
    () => ApiService.expenses.list(activeBusiness?.id),
    [activeBusiness?.id],
    { immediate: !!activeBusiness }
  );

  if (loading && !expenses) return <SuspenseLoader />;

  return (
    <div className="space-y-6">
      <Helmet><title>Expenses - Bangali Enterprise</title></Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expense Tracking</h1>
        <Button onClick={() => setDialogOpen(true)} variant="destructive"><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
      </div>

      <div className="space-y-4">
        {expenses?.map(expense => (
            <Card key={expense.id}>
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-bold">{expense.description || expense.category?.name}</p>
                        <p className="text-sm text-gray-500">{format(new Date(expense.expense_date), 'PPP')}</p>
                    </div>
                    <span className="font-bold text-red-500">-৳{expense.amount}</span>
                </CardContent>
            </Card>
        ))}
        {expenses?.length === 0 && <div className="text-center py-10 text-muted-foreground">No expenses recorded.</div>}
      </div>

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={reloadExpenses} />
    </div>
  );
};

export default ExpenseManagement;