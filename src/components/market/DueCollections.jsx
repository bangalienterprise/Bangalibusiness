import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Coins as HandCoins, User, Briefcase, Filter } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { addDays, format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CollectDueDialog from './CollectDueDialog';

const DueCollections = () => {
    const { sales, users, customers, refreshData } = useBusiness();
    const [date, setDate] = useState({ from: addDays(new Date(), -30), to: new Date() });
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [collectingSale, setCollectingSale] = useState(null);

    const dueSales = useMemo(() => {
        return (sales || [])
            .filter(sale => {
                const dueAmount = sale.final_amount - sale.amount_paid;
                if (dueAmount <= 0.01) return false;

                const saleDate = sale.sale_date ? parseISO(sale.sale_date) : new Date();
                const dateMatch = !date || !date.from || !date.to || (saleDate >= date.from && saleDate <= date.to);
                const sellerMatch = !selectedSeller || sale.seller_id === selectedSeller.id;
                const customerMatch = !selectedCustomer || sale.customer_id === selectedCustomer.id;

                return dateMatch && sellerMatch && customerMatch;
            })
            .sort((a, b) => {
                const dateA = a.sale_date ? parseISO(a.sale_date) : new Date(0);
                const dateB = b.sale_date ? parseISO(b.sale_date) : new Date(0);
                return dateB - dateA;
            });
    }, [sales, date, selectedSeller, selectedCustomer]);

    const totals = useMemo(() => {
        return dueSales.reduce((acc, sale) => {
            acc.totalDue += sale.final_amount - sale.amount_paid;
            return acc;
        }, { totalDue: 0 });
    }, [dueSales]);
    
    const handleClearFilters = () => {
        setDate({ from: addDays(new Date(), -30), to: new Date() });
        setSelectedSeller(null);
        setSelectedCustomer(null);
    };

    const sellers = useMemo(() => (users || []).filter(u => ['seller', 'manager', 'admin', 'owner'].includes(u.role)), [users]);
    const customersList = useMemo(() => customers || [], [customers]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Due Collections</CardTitle>
                            <CardDescription>Track and manage all outstanding payments from sales.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button onClick={handleClearFilters} variant="ghost" size="sm"><Filter className="w-4 h-4 mr-2"/>Clear Filters</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                        <DatePickerWithRange date={date} setDate={setDate} />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <User className="mr-2 h-4 w-4" />
                                    {selectedSeller ? selectedSeller.full_name || selectedSeller.username : 'All Sellers'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Filter by seller..." />
                                    <CommandList>
                                        <CommandEmpty>No seller found.</CommandEmpty>
                                        <CommandGroup>
                                            {sellers.map(s => <CommandItem key={s.id} onSelect={() => setSelectedSeller(s)}>{s.full_name || s.username}</CommandItem>)}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    {selectedCustomer ? selectedCustomer.name : 'All Customers'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Filter by customer..." />
                                    <CommandList>
                                        <CommandEmpty>No customer found.</CommandEmpty>
                                        <CommandGroup>
                                            {customersList.map(c => <CommandItem key={c.id} onSelect={() => setSelectedCustomer(c)}>{c.name}</CommandItem>)}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Card>
                        <CardHeader className="p-4 bg-muted/30">
                            <CardTitle className="text-xl">Total Due: ৳{totals.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Customer</TableHead>
                                        <TableHead>Sale Date</TableHead>
                                        <TableHead>Seller</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-right">Amount Paid</TableHead>
                                        <TableHead className="text-right text-destructive">Due Amount</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                    {dueSales.length > 0 ? (
                                        dueSales.map(sale => (
                                            <motion.tr key={sale.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/50">
                                                <TableCell>{sale.customer?.name || 'N/A'}</TableCell>
                                                <TableCell>{sale.sale_date ? format(parseISO(sale.sale_date), 'PPP') : 'N/A'}</TableCell>
                                                <TableCell>{sale.seller?.full_name || sale.seller?.username || 'N/A'}</TableCell>
                                                <TableCell className="text-right font-mono">৳{sale.final_amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-mono">৳{sale.amount_paid.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-mono text-destructive">৳{(sale.final_amount - sale.amount_paid).toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" onClick={() => setCollectingSale(sale)}>
                                                        <HandCoins className="mr-2 h-4 w-4" /> Collect
                                                    </Button>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No due payments found for the selected filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    </AnimatePresence>
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-right font-bold text-lg">Total Due</TableCell>
                                        <TableCell className="text-right font-bold text-lg text-destructive">৳{totals.totalDue.toLocaleString()}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            {collectingSale && (
                <CollectDueDialog
                    sale={collectingSale}
                    isOpen={!!collectingSale}
                    onClose={() => setCollectingSale(null)}
                    onSuccess={() => {
                        refreshData();
                        setCollectingSale(null);
                    }}
                />
            )}
        </motion.div>
    );
};

export default DueCollections;