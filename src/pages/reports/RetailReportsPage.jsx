import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, TrendingUp, Download, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardChart from '@/components/dashboard/shared/DashboardChart';
import DashboardTable from '@/components/dashboard/shared/DashboardTable';
import ReportsFilterBar from '@/components/reports/ReportsFilterBar';
import { useReportsData } from '@/hooks/useReportsData';
import { useExportData } from '@/hooks/useExportData';
import { useBusiness } from '@/contexts/BusinessContext';
import { TableCell, TableRow } from '@/components/ui/table';
import LoadingState, { LoadingSpinner } from '@/components/dashboard/shared/LoadingState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const RetailReportsPage = ({ dateRange, setDateRange, filters, setFilters }) => {
    const { business, users } = useBusiness();
    const { data, metrics, loading, error, refresh } = useReportsData({
        businessId: business?.id,
        dateRange,
        filters,
        businessType: 'retail'
    });
    const { exportToCSV } = useExportData();

    // Move useMemo to top level - before any conditional logic
    const salesOverTime = React.useMemo(() => {
        if (!data) return [];
        const grouped = data.reduce((acc, curr) => {
            const date = new Date(curr.sale_date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + (curr.final_amount || 0);
            return acc;
        }, {});
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [data]);

    const handleExport = () => {
        exportToCSV(data, 'retail_sales_report', {
            'sale_date': 'Date',
            'customer.name': 'Customer',
            'final_amount': 'Amount',
            'payment_method': 'Payment Method',
            'seller.full_name': 'Sold By'
        });
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error Loading Reports</AlertTitle>
                <AlertDescription className="flex flex-col gap-4">
                    <p>{error}</p>
                    <Button variant="outline" onClick={refresh} className="w-fit">Retry</Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ReportsFilterBar 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
                filters={filters} 
                setFilters={setFilters} 
                loading={loading}
                filterOptions={{ sellers: users }} // Pass available sellers for filtering
            />

            {/* Metrics */}
            {loading ? <LoadingState count={3} /> : (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{metrics.totalRevenue?.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">For selected period</p>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                            <p className="text-xs text-slate-500">Total transactions</p>
                        </CardContent>
                    </Card>
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Avg. Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{metrics.averageOrderValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            <p className="text-xs text-slate-500">Per transaction</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-1">
                <DashboardChart 
                    title="Sales Revenue Trend" 
                    data={salesOverTime} 
                    type="line" 
                    dataKey="value" 
                    loading={loading}
                    emptyMessage="No sales data in this period."
                />
            </div>

            {/* Detailed Table */}
            <DashboardTable 
                title="Detailed Sales Report" 
                headers={['Date', 'Customer', 'Items', 'Sold By', 'Amount']}
                loading={loading}
                emptyMessage="No sales found matching your filters."
            >
                {data.map(sale => (
                    <TableRow key={sale.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="text-slate-300">{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-slate-200">{sale.customer?.name || 'Guest'}</TableCell>
                        <TableCell className="text-slate-400">{sale.sale_items?.length || 0} items</TableCell>
                        <TableCell className="text-slate-400">{sale.seller?.full_name}</TableCell>
                        <TableCell className="text-right font-medium text-slate-200">৳{sale.final_amount?.toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </DashboardTable>
            
            <div className="flex justify-end">
                <Button onClick={handleExport} disabled={loading || data.length === 0} className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>
        </div>
    );
};

export default RetailReportsPage;