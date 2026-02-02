import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Filter, Phone, Calendar, ArrowUpDown, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const DueCollectionPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, overdue, current
    const [sortOrder, setSortOrder] = useState('desc'); // desc = highest due first
    
    // Payment Modal
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        if (user?.business_id) {
            const data = await mockDatabase.getAll('customers', user.business_id);
            // Filter only customers with dues
            const withDues = data.filter(c => c.total_due > 0);
            setCustomers(withDues);
        }
        setLoading(false);
    };

    const filteredCustomers = useMemo(() => {
        let result = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.phone.includes(searchTerm)
        );

        if (statusFilter === 'overdue') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            result = result.filter(c => new Date(c.last_purchase_date) < thirtyDaysAgo);
        }

        return result.sort((a, b) => {
            return sortOrder === 'desc' ? b.total_due - a.total_due : a.total_due - b.total_due;
        });
    }, [customers, searchTerm, statusFilter, sortOrder]);

    const handleCollectPayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
            return;
        }
        if (amount > selectedCustomer.total_due) {
            toast({ variant: "destructive", title: "Amount Exceeds Due", description: "Cannot collect more than total due." });
            return;
        }

        try {
            // Update customer record
            await mockDatabase.update('customers', selectedCustomer.id, {
                total_due: selectedCustomer.total_due - amount
            });

            // Create a collection record (could be a sale or separate collection table)
            // For now, let's log it as a transaction/sale with special status
            await mockDatabase.create('sales', {
                business_id: user.business_id,
                customer_id: selectedCustomer.id,
                customer_name: selectedCustomer.name,
                items: [{ product_name: "Due Collection", quantity: 1, unit_price: amount, subtotal: amount }],
                total: 0, // It's a payment, not a new sale
                amount_paid: amount,
                payment_method: paymentMethod,
                status: 'Collection',
                processed_by: user.id,
                date: new Date().toISOString()
            });

            toast({ title: "Payment Collected", description: `Collected ৳${amount} from ${selectedCustomer.name}` });
            setSelectedCustomer(null);
            setPaymentAmount('');
            loadData();
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Due Collection</title></Helmet>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Due Collection</h1>
                    <p className="text-slate-400">Manage and collect outstanding customer payments.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <span className="text-sm text-slate-400">Total Outstanding:</span>
                    <span className="text-xl font-bold text-red-400">
                        ৳{customers.reduce((sum, c) => sum + c.total_due, 0).toLocaleString()}
                    </span>
                </div>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-800">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input 
                                placeholder="Search customer name or phone..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 bg-slate-950 border-slate-700"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] bg-slate-950 border-slate-700">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="all">All Dues</SelectItem>
                                    <SelectItem value="overdue">Overdue (30+ Days)</SelectItem>
                                    <SelectItem value="current">Current</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button 
                                variant="outline" 
                                className="border-slate-700"
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            >
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-slate-800 hover:bg-slate-950">
                                <TableHead className="text-slate-400">Customer Info</TableHead>
                                <TableHead className="text-slate-400">Last Purchase</TableHead>
                                <TableHead className="text-slate-400 text-right">Total Due</TableHead>
                                <TableHead className="text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map(customer => (
                                <TableRow key={customer.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="font-medium text-white">{customer.name}</div>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <Phone className="h-3 w-3 mr-1" /> {customer.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-slate-400">
                                            <Calendar className="h-3 w-3 mr-2" />
                                            {customer.last_purchase_date ? format(new Date(customer.last_purchase_date), 'MMM d, yyyy') : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-950/20 text-sm font-bold px-2 py-1">
                                            ৳{customer.total_due.toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-500 text-white"
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            Collect Payment
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                        No customers found with due payments.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Payment Modal */}
            <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Collect Payment</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4 py-4">
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-500">Total Outstanding</p>
                                    <p className="text-xl font-bold text-red-400">৳{selectedCustomer.total_due}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{selectedCustomer.name}</p>
                                    <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                                    <Input 
                                        type="number" 
                                        className="pl-8 bg-slate-950 border-slate-700 font-bold"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Cash', 'Card', 'Online'].map(method => (
                                        <div 
                                            key={method}
                                            className={`p-2 border rounded cursor-pointer text-center text-sm ${paymentMethod === method ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-950 text-slate-400'}`}
                                            onClick={() => setPaymentMethod(method)}
                                        >
                                            {method}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="border-slate-700 text-slate-300">Cancel</Button>
                        <Button onClick={handleCollectPayment} className="bg-green-600 hover:bg-green-500">
                            <Banknote className="h-4 w-4 mr-2" /> Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DueCollectionPage;