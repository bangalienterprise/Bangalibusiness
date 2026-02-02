import React, { useState, useMemo } from 'react';
import { CheckCircle2, Search, Filter, TrendingDown, TrendingUp, DollarSign, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CollectPaymentDialog from './CollectPaymentDialog';
import { cn } from '@/lib/utils';

const MarketOverviewPage = () => {
    const { customers, sales, paymentCollections, refreshData } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('highest_due');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [collectDialogOpen, setCollectDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState('due_list');

    const today = new Date().toISOString().split('T')[0];

    const collectedToday = useMemo(() => {
        const collectionsSum = paymentCollections
            .filter(c => c.collection_date === today)
            .reduce((sum, c) => sum + c.amount_collected, 0);

        const salesToday = sales.filter(s => s.sale_date === today);
        let initialPaymentsSum = 0;
        
        salesToday.forEach(sale => {
            const saleCollections = paymentCollections.filter(c => c.sale_id === sale.id);
            const totalCollectedFromCollections = saleCollections.reduce((sum, c) => sum + c.amount_collected, 0);
            const initialPay = Math.max(0, sale.amount_paid - totalCollectedFromCollections);
            initialPaymentsSum += initialPay;
        });

        return collectionsSum + initialPaymentsSum;
    }, [paymentCollections, sales, today]);

    const lifetimeCollection = useMemo(() => {
        return sales.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
    }, [sales]);

    const customerData = useMemo(() => {
        if (!customers) return [];
        
        return customers.map(c => {
            const customerSales = sales.filter(s => s.customer_id === c.id);
            const totalPurchased = customerSales.reduce((sum, s) => sum + s.final_amount, 0);
            const totalPaid = customerSales.reduce((sum, s) => sum + s.amount_paid, 0);
            const currentDue = totalPurchased - totalPaid;
            
            return {
                ...c,
                totalPurchased,
                totalPaid,
                currentDue,
                lastActivity: customerSales.length > 0 
                    ? customerSales.sort((a,b) => new Date(b.sale_date) - new Date(a.sale_date))[0].sale_date 
                    : null
            };
        });
    }, [customers, sales]);

    const totalOutstandingDue = useMemo(() => {
        return customerData.reduce((sum, c) => sum + Math.max(0, c.currentDue), 0);
    }, [customerData]);

    const customersWithDuesCount = useMemo(() => {
        return customerData.filter(c => c.currentDue > 1).length;
    }, [customerData]);

    const filteredCustomers = useMemo(() => {
        let data = customerData.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm))
        );

        if (sortOrder === 'highest_due') {
            data.sort((a, b) => b.currentDue - a.currentDue);
        } else if (sortOrder === 'name') {
            data.sort((a, b) => a.name.localeCompare(b.name));
        }

        return data;
    }, [customerData, searchTerm, sortOrder, viewMode]);

    const handleCollectClick = (customer) => {
        setSelectedCustomer(customer);
        setCollectDialogOpen(true);
    };

    return (
        <div className="space-y-6 p-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
                    <p className="text-muted-foreground">Track customer dues, payments, and market cash flow.</p>
                </div>
                <div className="bg-secondary/50 p-1 rounded-lg flex gap-1">
                    <Button 
                        variant={viewMode === 'due_list' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setViewMode('due_list')}
                        className="text-xs font-semibold"
                    >
                        Due List
                    </Button>
                    <Button 
                        variant={viewMode === 'history' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => setViewMode('history')}
                        className="text-xs font-semibold"
                    >
                        Collection History
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white border-none shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 -skew-x-12 transform translate-x-10"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-100 uppercase tracking-wider">Total Outstanding Due</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-3xl font-bold">৳{totalOutstandingDue.toLocaleString()}</div>
                                <div className="flex items-center mt-2 text-red-100 text-sm">
                                    <User className="h-4 w-4 mr-1" />
                                    <span>{customersWithDuesCount} Customers with dues</span>
                                </div>
                            </div>
                            <TrendingDown className="h-12 w-12 text-red-300/50 mb-1" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 -skew-x-12 transform translate-x-10"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Collected Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-3xl font-bold">৳{collectedToday.toLocaleString()}</div>
                                <div className="flex items-center mt-2 text-emerald-100 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{format(new Date(), 'MM/dd/yyyy')}</span>
                                </div>
                            </div>
                            <TrendingUp className="h-12 w-12 text-emerald-300/50 mb-1" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-lg relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lifetime Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-3xl font-bold text-foreground">৳{lifetimeCollection.toLocaleString()}</div>
                                <div className="flex items-center mt-2 text-muted-foreground text-sm">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    <span>Total Verified Revenue</span>
                                </div>
                            </div>
                            <DollarSign className="h-12 w-12 text-muted-foreground/20 mb-1" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/10">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search customers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-background border-border"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'highest_due' ? 'name' : 'highest_due')}>
                            <Filter className="h-4 w-4 mr-2" />
                            Sort: {sortOrder === 'highest_due' ? 'Highest Due' : 'Name'}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-secondary/20">
                            <TableRow>
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead className="text-right">Total Purchased</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                                <TableHead className="text-right">Current Due</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((customer, index) => (
                                <TableRow key={customer.id} className="hover:bg-secondary/10 transition-colors">
                                    <TableCell className="text-center">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mx-auto">
                                            {index + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-base">{customer.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Last activity: {customer.lastActivity ? format(new Date(customer.lastActivity), 'MM/dd/yyyy') : 'Never'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium">৳{customer.totalPurchased.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono font-medium text-green-600">৳{customer.totalPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-destructive">৳{customer.currentDue.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        {customer.currentDue > 1 ? (
                                            <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                                                Overdue
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                                Settled
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            className={cn(
                                                "font-semibold",
                                                customer.currentDue > 1 ? "bg-blue-600 hover:bg-blue-700 text-white" : "opacity-50"
                                            )}
                                            disabled={customer.currentDue <= 1}
                                            onClick={() => handleCollectClick(customer)}
                                        >
                                            Collect
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No customers found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CollectPaymentDialog 
                open={collectDialogOpen} 
                onOpenChange={setCollectDialogOpen} 
                customer={selectedCustomer}
                onSuccess={refreshData}
            />
        </div>
    );
};

export default MarketOverviewPage;