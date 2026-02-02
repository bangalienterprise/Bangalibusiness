import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const ExpenseCategoryDetailsDialog = ({ open, onOpenChange, categoryName, expenses }) => {
    
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    const handleDownload = () => {
        if (!expenses || expenses.length === 0) return;
        
        const headers = "Date,Amount,Seller,Description";
        const csvRows = [headers];

        expenses.forEach(e => {
            const row = [
                e.date,
                e.amount.toFixed(2),
                e.sellerName || "N/A",
                `"${e.description.replace(/"/g, '""')}"`
            ].join(',');
            csvRows.push(row);
        });

        // Add a footer row for the total amount
        csvRows.push(''); // Add a blank line for separation
        const footerRow = `Total Amount,${totalAmount.toFixed(2)},,`;
        csvRows.push(footerRow);

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${categoryName}_expenses_details.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glassmorphic max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Details for: {categoryName}</DialogTitle>
                    <DialogDescription>
                        Total amount for this category: <span className="font-bold text-primary">৳{totalAmount.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <table className="w-full" data-responsive>
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Seller</th>
                                <th className="px-4 py-2 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id} className="border-b border-border/50">
                                    <td className="px-4 py-2" data-label="Date">{expense.date}</td>
                                    <td className="px-4 py-2 font-semibold" data-label="Amount">৳{expense.amount.toFixed(2)}</td>
                                    <td className="px-4 py-2" data-label="Seller">{expense.sellerName || 'N/A'}</td>
                                    <td className="px-4 py-2" data-label="Description">{expense.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {expenses.length === 0 && <p className="text-center p-8 text-muted-foreground">No expenses to show.</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleDownload} className="bg-primary hover:bg-primary/90">
                        <Download className="h-4 w-4 mr-2" /> Download CSV
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseCategoryDetailsDialog;