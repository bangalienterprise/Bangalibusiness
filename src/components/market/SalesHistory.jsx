import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Eye, Edit, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import SaleDetailsDialog from './SaleDetailsDialog';
import SaleEditDialog from './SaleEditDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const SalesHistory = () => {
    const { sales, customers, refreshData } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const customer = customers.find(c => c.id === sale.customer_id);
            const customerName = customer?.name?.toLowerCase() || '';
            const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || 
                                  sale.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDate = dateFilter ? sale.sale_date === format(dateFilter, 'yyyy-MM-dd') : true;

            return matchesSearch && matchesDate;
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [sales, customers, searchTerm, dateFilter]);

    const handleView = (sale) => {
        setSelectedSale(sale);
        setIsViewOpen(true);
    };

    const handleEdit = (sale) => {
        setSelectedSale(sale);
        setIsEditOpen(true);
    };

    const getCustomerName = (id) => {
        return customers.find(c => c.id === id)?.name || 'Unknown Customer';
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-end sm:items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by customer or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-background"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {dateFilter && (
                        <Button variant="ghost" onClick={() => setDateFilter(null)}>Clear</Button>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {filteredSales.length} transactions
                </div>
            </div>

            <div className="rounded-md border bg-card flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Due</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.map((sale) => {
                                const due = sale.final_amount - sale.amount_paid;
                                const status = due <= 0 ? 'Paid' : (sale.amount_paid > 0 ? 'Partial' : 'Unpaid');
                                
                                return (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-medium">{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>{getCustomerName(sale.customer_id)}</TableCell>
                                        <TableCell className="capitalize">{sale.payment_method.replace('_', ' ')}</TableCell>
                                        <TableCell className="text-right font-mono">৳{sale.final_amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">৳{sale.amount_paid.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono text-red-600">
                                            {due > 0 ? `৳${due.toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={status === 'Paid' ? 'default' : (status === 'Partial' ? 'secondary' : 'destructive')}>
                                                {status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleView(sale)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredSales.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        No sales found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedSale && (
                <>
                    <SaleDetailsDialog 
                        open={isViewOpen} 
                        onOpenChange={setIsViewOpen} 
                        sale={selectedSale} 
                    />
                    <SaleEditDialog 
                        open={isEditOpen} 
                        onOpenChange={setIsEditOpen} 
                        sale={selectedSale}
                        onSuccess={() => {
                            refreshData();
                            setIsEditOpen(false);
                        }}
                    />
                </>
            )}
        </Card>
    );
};

export default SalesHistory;