import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';

const ExpenseLogPage = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>Expenses - Bangali Enterprise</title>
            </Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Expense Log</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Recent Expenses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                        No expenses logged.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpenseLogPage;