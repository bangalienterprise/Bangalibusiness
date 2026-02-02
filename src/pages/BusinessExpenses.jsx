import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Settings, MoreVertical, Search, Filter, ShoppingCart, Banknote, Utensils, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ExpenseDialog from '@/components/expenses/ExpenseDialog';
import CategoryManagerDialog from '@/components/expenses/CategoryManagerDialog';
import SalesDialog from '@/components/sales/SalesDialog';

const BusinessExpenses = () => {
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const { activeBusiness } = useBusiness();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const loadData = useCallback(async () => {
        if (!activeBusiness) return;
        setLoading(true);
        try {
            const [expensesRes, categoriesRes] = await Promise.all([
                supabase.from('expenses').select('*, category:expense_categories(id, name), recordedBy:profiles!expenses_recorded_by_fkey(full_name, username)').eq('business_id', activeBusiness.id).eq('expense_type', 'business').order('expense_date', { ascending: false }),
                supabase.from('expense_categories').select('*').eq('business_id', activeBusiness.id).eq('expense_type', 'business').order('name')
            ]);
            if (expensesRes.error) throw expensesRes.error;
            setExpenses(expensesRes.data || []);
            if (categoriesRes.error) throw categoriesRes.error;
            setCategories(categoriesRes.data || []);
        } catch (error) {
            toast({ title: "Error loading data", description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [activeBusiness, toast]);

    useEffect(() => {
        if (activeBusiness) loadData();
    }, [loadData, activeBusiness]);

    const handleEdit = (expense) => {
        setSelectedExpense(expense);
        setIsExpenseDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!expenseToDelete) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', expenseToDelete.id);
            if (error) throw error;
            toast({ title: "Expense deleted successfully" });
            loadData();
        } catch (error) {
            toast({ title: "Error deleting expense", description: error.message, variant: 'destructive' });
        } finally {
            setExpenseToDelete(null);
        }
    };
    
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const searchMatch = searchTerm === '' ||
                exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exp.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exp.amount.toString().includes(searchTerm);
            const categoryMatch = categoryFilter === 'all' || exp.category_id === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [expenses, searchTerm, categoryFilter]);

    const { totalExpenses, totalIncome, totalMaintenance } = useMemo(() => {
        const incomeCategories = ['Bank Deposit', 'Cash Deposit'];
        const maintenanceCategoryNames = ['Vehicle Maintenance', 'Office Supplies', 'Office Stuff Cost'];

        return expenses.reduce((acc, exp) => {
            const categoryName = exp.category?.name || 'Uncategorized';
            if (incomeCategories.includes(categoryName)) {
                acc.totalIncome += exp.amount;
            } else {
                acc.totalExpenses += exp.amount;
            }
            if (maintenanceCategoryNames.includes(categoryName)){
                acc.totalMaintenance += exp.amount;
            }
            return acc;
        }, { totalExpenses: 0, totalIncome: 0, totalMaintenance: 0 });
    }, [expenses]);
    
    const incomeCategories = ['Bank Deposit', 'Cash Deposit'];

    if (!activeBusiness) return <div>Loading business...</div>;

    return (
        <>
            <Helmet>
                <title>Business Expenses - {activeBusiness.name}</title>
            </Helmet>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Business Transactions</h1>
                        <p className="text-muted-foreground">Track and manage all business-related expenses and income deposits.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button variant="secondary" size="icon" onClick={() => setIsCategoryDialogOpen(true)}><Settings className="h-4 w-4" /></Button>
                        <Button onClick={() => { setSelectedExpense(null); setIsExpenseDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
                        {hasPermission('manage_sales') && <Button onClick={() => setIsSalesDialogOpen(true)}><ShoppingCart className="mr-2 h-4 w-4" /> Record New Sale</Button>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Income (Deposits)</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-green-500">৳{totalIncome.toLocaleString()}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Expenses</CardTitle><Utensils className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-red-500">৳{totalExpenses.toLocaleString()}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle><Car className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><p className="text-2xl font-bold">৳{totalMaintenance.toLocaleString()}</p></CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>A log of all recorded income and expenses for the business.</CardDescription>
                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search by description, category, or amount..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-[200px]"><div className="flex items-center gap-2"><Filter className="h-4 w-4"/> <SelectValue placeholder="All Categories" /></div></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Recorded By</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">Loading transactions...</TableCell></TableRow>
                                ) : filteredExpenses.length > 0 ? filteredExpenses.map(expense => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                                        <TableCell><Badge variant="outline">{expense.category?.name || 'N/A'}</Badge></TableCell>
                                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                                        <TableCell>{expense.recordedBy?.full_name || expense.recordedBy?.username || 'N/A'}</TableCell>
                                        <TableCell className={`text-right font-mono ${incomeCategories.includes(expense.category?.name) ? 'text-green-500' : 'text-red-500'}`}>
                                            {incomeCategories.includes(expense.category?.name) ? '+' : '-'}৳{expense.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleEdit(expense)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                    {hasPermission('approve_deletions') && <DropdownMenuItem className="text-destructive" onClick={() => setExpenseToDelete(expense)}><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">No transactions found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <ExpenseDialog open={isExpenseDialogOpen} setOpen={setIsExpenseDialogOpen} expense={selectedExpense} categories={categories} onSuccess={loadData} defaultType="business" />
            <CategoryManagerDialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen} onSuccess={loadData} expenseType="business" />
            <SalesDialog open={isSalesDialogOpen} onOpenChange={setIsSalesDialogOpen} onSuccess={loadData} />
            <AlertDialog open={!!expenseToDelete} onOpenChange={() => setExpenseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the expense record. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default BusinessExpenses;