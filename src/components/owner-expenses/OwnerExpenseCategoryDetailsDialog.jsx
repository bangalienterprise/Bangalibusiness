import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';

const OwnerExpenseCategoryDetailsDialog = ({ open, setOpen, category, expenses }) => {
    if (!category) return null;

    const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
    const totalAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md glassmorphic">
                <DialogHeader>
                    <DialogTitle>{category.name}</DialogTitle>
                    <DialogDescription>
                        Details for the "{category.name}" expense category.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4 p-3 bg-secondary/50 rounded-lg">
                        <span className="font-bold text-lg">Total Spent:</span>
                        <span className="font-bold text-lg text-primary">${totalAmount.toFixed(2)}</span>
                    </div>

                    <h3 className="mb-2 font-semibold">Expenses in this category:</h3>
                    <ScrollArea className="h-60">
                         {categoryExpenses.length > 0 ? (
                            <ul className="space-y-2">
                                {categoryExpenses.map(expense => (
                                    <li key={expense.id} className="flex justify-between items-center p-2 rounded-md bg-background/50">
                                        <div>
                                            <p className="font-medium">{expense.description}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline">${expense.amount.toFixed(2)}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No expenses found in this category.</p>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OwnerExpenseCategoryDetailsDialog;