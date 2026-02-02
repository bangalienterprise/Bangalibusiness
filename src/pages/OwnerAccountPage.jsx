import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Banknote, Landmark, ShoppingCart, PlusCircle, Download, PackageX, PackagePlus } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import Papa from 'papaparse';
import { Badge } from '@/components/ui/badge';

const MoneyCollectDialog = ({ open, setOpen, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [type, setType] = useState('money_collected_cash');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSave = async () => {
        if (!amount || !date || !type) {
            toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from('owner_account_transactions').insert({
                user_id: user.id,
                transaction_date: date,
                transaction_type: type,
                amount: parseFloat(amount),
                description: description || (type === 'money_collected_cash' ? 'Cash deposit to business' : 'Bank deposit to business'),
            });
            if (error) throw error;
            toast({ title: "Success", description: "Transaction recorded." });
            onSuccess();
            setOpen(false);
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Money Collection</DialogTitle>
                    <DialogDescription>Record funds you are providing to the business.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="money_collected_cash">Cash Deposit</SelectItem>
                                <SelectItem value="money_collected_bank">Bank Deposit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Funds for marketing" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Transaction'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const OwnerAccountPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [date, setDate] = useState({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    const [isCollectDialogOpen, setIsCollectDialogOpen] = useState(false);

    const fetchData = useCallback(async (startDate, endDate) => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('owner_account_transactions')
                .select('*')
                .eq('user_id', user.id)
                .gte('transaction_date', startDate)
                .lte('transaction_date', endDate)
                .order('transaction_date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            toast({ title: 'Error fetching transactions', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (date?.from && date?.to) {
            fetchData(format(date.from, 'yyyy-MM-dd'), format(date.to, 'yyyy-MM-dd'));
        }
    }, [date, fetchData]);

    const { salaryTotal, collectedCashTotal, collectedBankTotal, paymentTotal, adjustmentTotal, salaryTx, collectedCashTx, collectedBankTx, paymentTx, adjustmentTx } = useMemo(() => {
        const salaryTx = transactions.filter(t => t.transaction_type === 'salary');
        const collectedCashTx = transactions.filter(t => t.transaction_type === 'money_collected_cash');
        const collectedBankTx = transactions.filter(t => t.transaction_type === 'money_collected_bank');
        const paymentTx = transactions.filter(t => t.transaction_type === 'payment_stock');
        const adjustmentTx = transactions.filter(t => t.transaction_type === 'stock_adjustment');
        
        return {
            salaryTotal: salaryTx.reduce((sum, t) => sum + t.amount, 0),
            collectedCashTotal: collectedCashTx.reduce((sum, t) => sum + t.amount, 0),
            collectedBankTotal: collectedBankTx.reduce((sum, t) => sum + t.amount, 0),
            paymentTotal: paymentTx.reduce((sum, t) => sum + t.amount, 0),
            adjustmentTotal: adjustmentTx.reduce((sum, t) => sum + t.amount, 0),
            salaryTx,
            collectedCashTx,
            collectedBankTx,
            paymentTx,
            adjustmentTx,
        };
    }, [transactions]);
    
    const formatCurrency = (value, showSign = false) => {
      const formatted = `৳${Math.abs(Number(value)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (showSign) {
        return value >= 0 ? `+${formatted}` : `-${formatted}`;
      }
      return formatted;
    }

    const handleExport = (data, filename) => {
        if(data.length === 0) {
            toast({title: "No data to export.", variant: "destructive"});
            return;
        }
        const csv = Papa.unparse(data.map(d => ({...d, amount: `"${d.amount}"` })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const getBadgeForTx = (tx) => {
        switch (tx.transaction_type) {
            case 'salary': return <Badge variant="default" className="bg-green-500/20 text-green-700">Salary</Badge>;
            case 'money_collected_cash': return <Badge variant="default" className="bg-blue-500/20 text-blue-700">Cash Deposit</Badge>;
            case 'money_collected_bank': return <Badge variant="default" className="bg-cyan-500/20 text-cyan-700">Bank Deposit</Badge>;
            case 'payment_stock': return <Badge variant="destructive">Stock Purchase</Badge>;
            case 'stock_adjustment': 
                return tx.amount >= 0 ? 
                    <Badge variant="default" className="bg-purple-500/20 text-purple-700">Stock Gain</Badge> : 
                    <Badge variant="destructive">Stock Loss</Badge>;
            default: return <Badge variant="secondary">Other</Badge>;
        }
    }

    const TransactionList = ({ transactions, title }) => (
        <div className="space-y-2">
            {transactions.length > 0 ? transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div>
                        <p className="font-medium text-sm flex items-center gap-2">{getBadgeForTx(tx)} {tx.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(tx.transaction_date), 'PPP')}</p>
                    </div>
                    <div className={`font-semibold text-sm ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(tx.amount, true)}</div>
                </div>
            )) : <p className="text-muted-foreground text-center py-4">No transactions for this period.</p>}
        </div>
    );

    return (
        <>
            <Helmet><title>Owner Account - Bangali Enterprise</title></Helmet>
            <MoneyCollectDialog open={isCollectDialogOpen} setOpen={setIsCollectDialogOpen} onSuccess={() => fetchData(format(date.from, 'yyyy-MM-dd'), format(date.to, 'yyyy-MM-dd'))} />

            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Owner Account</h1>
                        <p className="text-muted-foreground">Your personal financial ledger with the business.</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button onClick={() => setIsCollectDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/> Add Deposit</Button>
                        <DatePickerWithRange date={date} setDate={setDate} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base font-medium">My Salary</CardTitle><Wallet className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{formatCurrency(salaryTotal)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base font-medium">Cash Deposits</CardTitle><Banknote className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-500">{formatCurrency(collectedCashTotal)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base font-medium">Bank Deposits</CardTitle><Landmark className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-cyan-500">{formatCurrency(collectedBankTotal)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base font-medium">Stock Payments</CardTitle><ShoppingCart className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><div className={`text-2xl font-bold ${paymentTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(paymentTotal)}</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base font-medium">Stock Adjustments</CardTitle>{adjustmentTotal >= 0 ? <PackagePlus className="h-5 w-5 text-muted-foreground"/> : <PackageX className="h-5 w-5 text-muted-foreground"/>}</CardHeader><CardContent><div className={`text-2xl font-bold ${adjustmentTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(adjustmentTotal)}</div></CardContent></Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                           <CardTitle>All Transactions</CardTitle>
                           <Button variant="ghost" size="sm" onClick={() => handleExport(transactions, 'owner-transactions.csv')}><Download className="h-4 w-4"/></Button>
                        </div>
                        <CardDescription>Consolidated view of all personal financial interactions with the business.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[60vh] overflow-y-auto">
                        <TransactionList transactions={transactions} title="transactions" />
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default OwnerAccountPage;