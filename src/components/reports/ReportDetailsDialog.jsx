import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const ReportDetailsDialog = ({ open, onOpenChange, reportData }) => {
    const { sales, expenses, damages, summary } = reportData || {};

    const handleDownload = () => {
        const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const sections = [
            "FINANCIAL SUMMARY",
            `Period: ${summary.startDate} to ${summary.endDate}`,
            `Total Revenue: ৳${summary.totalRevenue.toFixed(2)}`,
            `Total Cost of Goods Sold: ৳${summary.totalCost.toFixed(2)}`,
            `Gross Profit: ৳${summary.totalProfit.toFixed(2)}`,
            `Total Expenses: ৳${summary.totalExpenses.toFixed(2)}`,
            `NET PROFIT: ৳${summary.netProfit.toFixed(2)}`,
            "\n",
            "--- SALES DETAILS ---",
            "Date,Product,Quantity,Unit Price,Total,Collected,Due",
            ...sales.map(s => `${s.date},${s.productName},${s.quantity},${s.unitPrice},${s.totalAmount},${s.collectedAmount},${s.dueAmount}`),
            "\n",
            "--- EXPENSE DETAILS ---",
            "Date,Category,Amount,Description,Seller",
            ...expenses.map(e => `${e.date},${e.categoryName},${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}",${e.sellerName || 'N/A'}`),
            "",
            `Total Expenses:,${totalExpensesAmount.toFixed(2)}`,
            "\n",
            "--- DAMAGE DETAILS ---",
            "Date,Product,Quantity,Reason,Loss Amount,Status",
            ...damages.map(d => `${d.date},${d.productName},${d.quantity},${d.reason},${d.lossAmount},${d.status || 'Damaged'}`)
        ];
        
        const csvContent = sections.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `full_report_${summary.startDate}_to_${summary.endDate}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!reportData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glassmorphic max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Full Financial Report</DialogTitle>
                    <DialogDescription>
                        Detailed report from {summary.startDate} to {summary.endDate}.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="summary" className="flex-grow flex flex-col">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="expenses">Expenses</TabsTrigger>
                        <TabsTrigger value="damages">Damages</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow overflow-y-auto mt-4 pr-2">
                        <TabsContent value="summary"><SummaryTab summary={summary} /></TabsContent>
                        <TabsContent value="sales"><DetailsTable data={sales} type="sales" /></TabsContent>
                        <TabsContent value="expenses"><DetailsTable data={expenses} type="expenses" /></TabsContent>
                        <TabsContent value="damages"><DetailsTable data={damages} type="damages" /></TabsContent>
                    </div>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" /> Download Full Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SummaryTab = ({ summary }) => (
    <div className="space-y-4 p-4">
        <SummaryCard title="Total Revenue" value={summary.totalRevenue} color="green"/>
        <SummaryCard title="Total Cost" value={summary.totalCost} color="orange"/>
        <SummaryCard title="Gross Profit" value={summary.totalProfit} color="blue"/>
        <SummaryCard title="Total Expenses" value={summary.totalExpenses} color="red"/>
        <div className={cn("p-4 rounded-lg", summary.netProfit >= 0 ? "bg-green-600/20" : "bg-red-600/20")}>
            <p className="text-lg font-semibold">Net Profit</p>
            <p className={cn("text-2xl font-bold", summary.netProfit >= 0 ? "text-green-400" : "text-red-400")}>
                ৳{summary.netProfit.toFixed(2)}
            </p>
        </div>
    </div>
);

const SummaryCard = ({ title, value, color }) => (
    <div className={`p-4 rounded-lg bg-${color}-600/10`}>
        <p className={`text-sm text-${color}-400`}>{title}</p>
        <p className="text-xl font-bold">৳{value.toFixed(2)}</p>
    </div>
);


const DetailsTable = ({ data, type }) => {
    const headers = {
        sales: ["Date", "Product", "Qty", "Total", "Due"],
        expenses: ["Date", "Category", "Amount", "Seller", "Description"],
        damages: ["Date", "Product", "Qty", "Reason", "Loss"],
    };
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        {headers[type].map(h => <th key={h} className="p-2 text-left font-semibold">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="border-b border-border/50">
                            {type === 'sales' && <>
                                <td className="p-2">{item.date}</td>
                                <td className="p-2">{item.productName}</td>
                                <td className="p-2">{item.quantity}</td>
                                <td className="p-2">৳{item.totalAmount.toFixed(2)}</td>
                                <td className="p-2 text-destructive">৳{item.dueAmount.toFixed(2)}</td>
                            </>}
                            {type === 'expenses' && <>
                                <td className="p-2">{item.date}</td>
                                <td className="p-2">{item.categoryName}</td>
                                <td className="p-2">৳{item.amount.toFixed(2)}</td>
                                <td className="p-2">{item.sellerName || 'N/A'}</td>
                                <td className="p-2">{item.description}</td>
                            </>}
                             {type === 'damages' && <>
                                <td className="p-2">{item.date}</td>
                                <td className="p-2">{item.productName}</td>
                                <td className="p-2">{item.quantity}</td>
                                <td className="p-2">{item.reason}</td>
                                <td className="p-2 text-destructive">৳{item.lossAmount.toFixed(2)}</td>
                            </>}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && <p className="text-center p-8 text-muted-foreground">No {type} data for this period.</p>}
        </div>
    );
};


export default ReportDetailsDialog;