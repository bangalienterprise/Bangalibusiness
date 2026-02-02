import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { DollarSign, Wallet, Landmark, Briefcase, Package, ShoppingCart, Wrench, PlusCircle, ShieldAlert, Banknote, PackageCheck, ChevronDown, Download, Gem } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/contexts/BusinessContext';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { startOfMonth, endOfMonth, format } from 'date-fns';

const OwnerAccountDashboard = () => {
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { businesses, loading: businessesLoading } = useBusiness();
    const navigate = useNavigate();
    
    const [date, setDate] = useState({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    
    const [globalStats, setGlobalStats] = useState({
        totalProducts: 0, totalSales: 0, totalDamages: 0, pendingApprovals: 0,
    });
    
    const [financials, setFinancials] = useState({
        salesCash: { total: 0, count: 0, transactions: [] },
        salesBank: { total: 0, count: 0, transactions: [] },
        productsPurchased: { total: 0, count: 0, transactions: [] },
        salariesPaid: { total: 0, count: 0, transactions: [] },
        supplierPayments: { total: 0, count: 0, transactions: [] },
        businessExpenseCashDeposits: { total: 0, count: 0, transactions: [] },
        businessExpenseBankDeposits: { total: 0, count: 0, transactions: [] },
    });
    
    const fetchFinancials = useCallback(async (startDate, endDate) => {
        setLoading(true);
        try {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            const [salesRes, salaryRes, expensesRes] = await Promise.all([
                supabase.from('sales').select('*, customer:customers(name), seller:profiles!sales_seller_id_fkey(username)').gte('sale_date', formattedStartDate).lte('sale_date', formattedEndDate),
                supabase.from('salaries').select('*, user:profiles(full_name, username)').gte('payment_date', formattedStartDate).lte('payment_date', formattedEndDate),
                supabase.from('expenses').select('*, category:expense_categories(name), seller:profiles!expenses_seller_id_fkey(username), recordedBy:profiles!expenses_recorded_by_fkey(username)').gte('expense_date', formattedStartDate).lte('expense_date', formattedEndDate)
            ]);

            if (salesRes.error) throw salesRes.error;
            if (salaryRes.error) throw salaryRes.error;
            if (expensesRes.error) throw expensesRes.error;

            const salesData = salesRes.data || [];
            const salaryData = salaryRes.data || [];
            const expensesData = expensesRes.data || [];

            const salesCash = salesData.filter(s => s.payment_method === 'cash');
            const salesBank = salesData.filter(s => s.payment_method === 'bank_transfer' || s.payment_method === 'card');
            
            const supplierPayments = expensesData.filter(e => e.category?.name?.toLowerCase() === 'supplier payment' || e.seller_id);
            const businessExpenseCashDeposits = expensesData.filter(e => e.category?.name?.toLowerCase() === 'cash deposit');
            const businessExpenseBankDeposits = expensesData.filter(e => e.category?.name?.toLowerCase() === 'bank deposit');
            const productPurchases = expensesData.filter(e => e.category?.name?.toLowerCase() === 'product purchase');

            setFinancials({
                salesCash: { total: salesCash.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0), count: salesCash.length, transactions: salesCash },
                salesBank: { total: salesBank.reduce((sum, s) => sum + Number(s.amount_paid || 0), 0), count: salesBank.length, transactions: salesBank },
                productsPurchased: { total: productPurchases.reduce((sum, s) => sum + Number(s.amount || 0), 0), count: productPurchases.length, transactions: productPurchases },
                salariesPaid: { total: salaryData.reduce((sum, s) => sum + Number(s.amount || 0), 0), count: salaryData.length, transactions: salaryData },
                supplierPayments: { total: supplierPayments.reduce((sum, e) => sum + Number(e.amount || 0), 0), count: supplierPayments.length, transactions: supplierPayments },
                businessExpenseCashDeposits: { total: businessExpenseCashDeposits.reduce((sum, e) => sum + Number(e.amount || 0), 0), count: businessExpenseCashDeposits.length, transactions: businessExpenseCashDeposits },
                businessExpenseBankDeposits: { total: businessExpenseBankDeposits.reduce((sum, e) => sum + Number(e.amount || 0), 0), count: businessExpenseBankDeposits.length, transactions: businessExpenseBankDeposits },
            });

        } catch (error) {
            console.error("Error fetching financials:", error);
            toast({ title: "Error fetching dashboard data", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchGlobalData = useCallback(async () => {
        try {
            const { count: productsCount } = await supabase.from('products').select('id', { count: 'exact', head: true });
            const { count: salesCount } = await supabase.from('sales').select('id', { count: 'exact', head: true });
            const { data: damageData, error: damageError } = await supabase.from('damages').select('loss_amount');
            if(damageError) throw damageError;
            const { count: pendingApprovalsCount } = await supabase.from('deletion_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            
            setGlobalStats({
                totalProducts: productsCount || 0,
                totalSales: salesCount || 0,
                totalDamages: damageData?.reduce((sum, d) => sum + Number(d.loss_amount || 0), 0) || 0,
                pendingApprovals: pendingApprovalsCount || 0,
            });
        } catch (error) {
            console.error("Error fetching global data:", error);
        }
    }, []);

    useEffect(() => {
        if (!businessesLoading) fetchGlobalData();
    }, [fetchGlobalData, businessesLoading]);

    useEffect(() => {
        if (date?.from && date?.to) {
            fetchFinancials(date.from, date.to);
        }
    }, [date, fetchFinancials]);
    
    const handleExport = () => {
        const { salesCash, salesBank, productsPurchased, salariesPaid, supplierPayments, businessExpenseCashDeposits, businessExpenseBankDeposits } = financials;
        let combinedData = [];

        salesCash.transactions.forEach(t => combinedData.push({ Type: 'Cash Deposit (Sale)', Date: t.sale_date, Description: `Sale by ${t.seller?.username}`, Amount: t.amount_paid }));
        salesBank.transactions.forEach(t => combinedData.push({ Type: 'Bank Deposit (Sale)', Date: t.sale_date, Description: `Sale by ${t.seller?.username}`, Amount: t.amount_paid }));
        businessExpenseCashDeposits.transactions.forEach(t => combinedData.push({ Type: 'BizEx Cash Deposit', Date: t.expense_date, Description: t.description, Amount: t.amount }));
        businessExpenseBankDeposits.transactions.forEach(t => combinedData.push({ Type: 'BizEx Bank Deposit', Date: t.expense_date, Description: t.description, Amount: t.amount }));
        productsPurchased.transactions.forEach(t => combinedData.push({ Type: 'Product Purchase', Date: t.expense_date, Description: t.description, Amount: -t.amount }));
        salariesPaid.transactions.forEach(t => combinedData.push({ Type: 'Salary', Date: t.payment_date, Description: `Salary for ${t.user?.full_name}`, Amount: -t.amount }));
        supplierPayments.transactions.forEach(t => combinedData.push({ Type: 'Supplier Payment', Date: t.expense_date, Description: `${t.description} (Supplier: ${t.seller?.username})`, Amount: -t.amount }));
        
        if(combinedData.length === 0) {
            toast({ title: "No data to export", description: "There are no transactions in the selected date range." });
            return;
        }

        const csv = Papa.unparse(combinedData);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `owner_dashboard_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
    const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const TransactionTable = ({ title, transactions, columns }) => (
         <Collapsible className="bg-card/50 rounded-lg border">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-secondary/50 rounded-t-lg transition-colors">
                <h3 className="font-semibold">{title}</h3>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{transactions.length} transaction(s)</span>
                    <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-0 md:p-4">
                {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b">{columns.map(c => <th key={c.key} className="p-2 text-left font-semibold">{c.header}</th>)}</tr></thead>
                            <tbody>{transactions.map((tx, index) => (<tr key={tx.id || index} className="border-b last:border-0 hover:bg-secondary/20">
                                {columns.map(c => <td key={c.key} className="p-2 whitespace-nowrap">{c.render(tx)}</td>)}</tr>))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-muted-foreground p-4">No transactions for this period.</p>}
            </CollapsibleContent>
        </Collapsible>
    );

    return (
        <>
            <Helmet><title>Owner Dashboard - Bangali Enterprise</title></Helmet>
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Owner's Dashboard</h1>
                        <p className="text-muted-foreground">A complete financial overview of all business entities.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <DatePickerWithRange date={date} setDate={setDate} />
                         <Button onClick={handleExport} variant="outline" size="icon" aria-label="Export to CSV"><Download className="h-4 w-4"/></Button>
                    </div>
                </motion.div>

                <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    {[
                        { title: "Sales Cash", value: formatCurrency(financials.salesCash.total), icon: Banknote, color: "text-[#22c55e]", count: financials.salesCash.count },
                        { title: "Sales Bank", value: formatCurrency(financials.salesBank.total), icon: Landmark, color: "text-[#3b82f6]", count: financials.salesBank.count },
                        { title: "BizEx Cash Deposit", value: formatCurrency(financials.businessExpenseCashDeposits.total), icon: Banknote, color: "text-green-400", count: financials.businessExpenseCashDeposits.count },
                        { title: "BizEx Bank Deposit", value: formatCurrency(financials.businessExpenseBankDeposits.total), icon: Landmark, color: "text-blue-400", count: financials.businessExpenseBankDeposits.count },
                        { title: "Supplier Payments", value: formatCurrency(financials.supplierPayments.total), icon: Gem, color: "text-[#a855f7]", count: financials.supplierPayments.count },
                        { title: "Products Purchased", value: formatCurrency(financials.productsPurchased.total), icon: PackageCheck, color: "text-[#f59e0b]", count: financials.productsPurchased.count },
                        { title: "Salaries Paid", value: formatCurrency(financials.salariesPaid.total), icon: Wallet, color: "text-[#ef4444]", count: financials.salariesPaid.count }
                    ].map(item => (
                        <motion.div variants={itemVariants} key={item.title}>
                           <Card className="h-full bg-card/80 backdrop-blur-sm">
                               <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{item.title}</CardTitle><item.icon className={`h-4 w-4 text-muted-foreground`} /></CardHeader>
                               <CardContent>
                                    <div className={`text-2xl font-bold ${item.color}`}>{loading ? '...' : item.value}</div>
                                    <p className="text-xs text-muted-foreground">{loading ? '' : `${item.count} transaction(s)`}</p>
                                </CardContent>
                           </Card>
                        </motion.div>
                   ))}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <TransactionTable title="Sales Cash Deposits" transactions={financials.salesCash.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.sale_date), 'PPP') },
                        { key: 'seller', header: 'Seller', render: (tx) => tx.seller?.username || 'N/A' },
                        { key: 'customer', header: 'Customer', render: (tx) => tx.customer?.name || 'N/A' },
                        { key: 'amount', header: 'Amount', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount_paid)}</span> }
                    ]} />
                    <TransactionTable title="Sales Bank Deposits" transactions={financials.salesBank.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.sale_date), 'PPP') },
                        { key: 'seller', header: 'Seller', render: (tx) => tx.seller?.username || 'N/A' },
                        { key: 'customer', header: 'Customer', render: (tx) => tx.customer?.name || 'N/A' },
                        { key: 'amount', header: 'Amount', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount_paid)}</span> }
                    ]} />
                    <TransactionTable title="Business Expense Cash Deposits" transactions={financials.businessExpenseCashDeposits.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.expense_date), 'PPP') },
                        { key: 'desc', header: 'Description', render: (tx) => tx.description || 'N/A' },
                        { key: 'recorded_by', header: 'Deposited By', render: (tx) => tx.recordedBy?.full_name || 'N/A'},
                        { key: 'amount', header: 'Amount', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount)}</span> }
                    ]} />
                    <TransactionTable title="Business Expense Bank Deposits" transactions={financials.businessExpenseBankDeposits.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.expense_date), 'PPP') },
                        { key: 'desc', header: 'Description', render: (tx) => tx.description || 'N/A' },
                        { key: 'recorded_by', header: 'Deposited By', render: (tx) => tx.recordedBy?.full_name || 'N/A'},
                        { key: 'amount', header: 'Amount', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount)}</span> }
                    ]} />
                    <TransactionTable title="Supplier Payments Details" transactions={financials.supplierPayments.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.expense_date), 'PPP') },
                        { key: 'supplier', header: 'Supplier', render: (tx) => tx.seller?.username || 'N/A' },
                        { key: 'desc', header: 'Description', render: (tx) => tx.description || 'N/A' },
                        { key: 'amount', header: 'Amount', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount)}</span> }
                    ]} />
                    <TransactionTable title="Products Purchased Details" transactions={financials.productsPurchased.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.expense_date), 'PPP') },
                        { key: 'desc', header: 'Description', render: (tx) => tx.description || 'N/A' },
                        { key: 'amount', header: 'Total Cost', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount)}</span> }
                    ]} />
                    <TransactionTable title="Salaries Paid Details" transactions={financials.salariesPaid.transactions} columns={[
                        { key: 'date', header: 'Date', render: (tx) => format(new Date(tx.payment_date), 'PPP') },
                        { key: 'employee', header: 'Employee', render: (tx) => tx.user?.full_name || 'N/A' },
                        { key: 'method', header: 'Method', render: (tx) => tx.payment_method },
                        { key: 'amount', header: 'Amount', render: (tx) => <span className="font-mono">{formatCurrency(tx.amount)}</span> }
                    ]} />
                </motion.div>

                 <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <Card>
                        <CardHeader><CardTitle>Operational Snapshot</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                           {[
                                { title: "Total Products", value: (globalStats.totalProducts || 0).toLocaleString(), icon: Package, path: "/products" },
                                { title: "Total Sales Orders", value: (globalStats.totalSales || 0).toLocaleString(), icon: ShoppingCart, path: "/sales" },
                                { title: "Total Damages (Value)", value: formatCurrency(globalStats.totalDamages), icon: Wrench, path: "/damage" },
                                { title: "Pending Approvals", value: globalStats.pendingApprovals, icon: ShieldAlert, path: "/approvals" }
                           ].map(item => (
                                <Link to={item.path} key={item.title} className="bg-secondary/50 p-4 rounded-lg hover:bg-secondary transition-colors">
                                   <div className="flex items-center justify-between mb-1"><p className="text-sm text-muted-foreground">{item.title}</p><item.icon className="h-4 w-4 text-muted-foreground"/></div>
                                   <p className="text-xl font-bold">{item.value}</p>
                                </Link>
                           ))}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                           <Button onClick={() => navigate('/businesses')} className="flex-1"><Briefcase className="h-4 w-4 mr-2" />Manage Businesses</Button>
                           <Button onClick={() => navigate('/users')} className="flex-1"><PlusCircle className="h-4 w-4 mr-2" />Manage Users</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </>
    );
};

export default OwnerAccountDashboard;