import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2, Settings, AlertTriangle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ExpenseDialog from '@/components/expenses/ExpenseDialog';
import CategoryManagerDialog from '@/components/expenses/CategoryManagerDialog';
import { Link } from 'react-router-dom';

const OwnerExpensesPage = () => {
    const { toast } = useToast();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, hasPermission } = useAuth();
    const { activeBusiness } = useBusiness();
    
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDeletionRequestDialogOpen, setDeletionRequestDialogOpen] = useState(false);
    const [deletionReason, setDeletionReason] = useState("");
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const isOwner = useMemo(() => hasPermission('owner_only_access'), [hasPermission]);

    const loadData = useCallback(async () => {
        if (!activeBusiness) return;
        setLoading(true);
        try {
            const [expensesRes, categoriesRes] = await Promise.all([
                supabase.from('expenses').select('*, category:expense_categories(id, name), recordedBy:profiles!expenses_recorded_by_fkey(full_name), requester:profiles!expenses_deletion_requested_by_fkey(full_name)').eq('business_id', activeBusiness.id).eq('expense_type', 'owner').order('expense_date', { ascending: false }),
                supabase.from('expense_categories').select('*').eq('business_id', activeBusiness.id).eq('expense_type', 'owner').order('name', { ascending: true })
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
        if (activeBusiness) {
            loadData();
        }
    }, [loadData, activeBusiness]);

    const handleEdit = (expense) => {
        setSelectedExpense(expense);
        setIsExpenseDialogOpen(true);
    };

    const handleDeleteClick = (expense) => {
        setExpenseToDelete(expense);
        if (isOwner) {
            // The AlertDialog will be triggered by the button's `asChild` prop
        } else {
            setDeletionRequestDialogOpen(true);
        }
    };
    
    const handleConfirmOwnerDelete = async () => {
        if (!expenseToDelete) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', expenseToDelete.id);
            if (error) throw error;
            toast({ title: "Success", description: "Expense has been deleted." });
            setExpenseToDelete(null);
            loadData();
        } catch (error) {
            toast({ title: "Error Deleting Expense", description: error.message, variant: "destructive" });
        }
    };
    
    const handleRequestDeletion = async () => {
        if (!expenseToDelete || !deletionReason) {
            toast({ title: "Reason required", description: "Please provide a reason for the deletion request.", variant: "destructive"});
            return;
        }
        try {
            const { error } = await supabase.from('deletion_requests').insert({
                user_id: user.id,
                business_id: activeBusiness.id,
                item_id: expenseToDelete.id,
                item_type: 'owner_expense',
                item_data: expenseToDelete,
                reason: deletionReason,
                status: 'pending'
            });

            if (error) throw error;

            // Also update the expense item itself to mark it as pending deletion
            const { error: updateError } = await supabase
                .from('expenses')
                .update({ 
                    deletion_status: 'pending',
                    deletion_requested_by: user.id,
                    deletion_reason: deletionReason
                })
                .eq('id', expenseToDelete.id);

            if(updateError) throw updateError;
            
            toast({ title: "Request Submitted", description: "Your request to delete the expense has been sent for approval." });
            setDeletionRequestDialogOpen(false);
            setDeletionReason('');
            setExpenseToDelete(null);
            loadData();
        } catch (error) {
            toast({ title: "Error submitting request", description: error.message, variant: "destructive" });
        }
    };

    const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
    
    return (
        <>
            <Helmet>
                <title>Owner Expenses - Bangali Enterprise</title>
                <meta name="description" content="Manage owner-specific expenses and investments." />
            </Helmet>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Owner Expenses</h1>
                        <p className="text-muted-foreground">Manage personal investments and expenses related to the business.</p>
                    </div>
                     <div className="flex gap-2 items-center">
                        <Link to="/business-expenses"><Button variant="outline">Business Expenses</Button></Link>
                        <Button onClick={() => { setSelectedExpense(null); setIsExpenseDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                        <Button variant="secondary" size="icon" onClick={() => setIsCategoryDialogOpen(true)}>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Owner Expenses</CardTitle>
                        <CardDescription>The total amount of owner-related expenses recorded.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">৳{totalExpenses.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expense History</CardTitle>
                         <CardDescription>A log of all owner-specific expenses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center p-8">Loading expenses...</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.length > 0 ? expenses.map(expense => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{expense.category?.name || 'N/A'}</TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell className="text-right font-mono">৳{expense.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                                {expense.deletion_status === 'pending' ? (
                                                     <Badge variant="destructive" className="flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Pending Deletion
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <BadgeCheck className="h-3 w-3 text-green-500"/>
                                                        Active
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)} disabled={expense.deletion_status === 'pending'}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {isOwner ? (
                                                    <AlertDialog open={expenseToDelete?.id === expense.id} onOpenChange={(isOpen) => !isOpen && setExpenseToDelete(null)}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setExpenseToDelete(expense)} disabled={expense.deletion_status === 'pending'}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the expense. This action cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleConfirmOwnerDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                ) : (
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(expense)} disabled={expense.deletion_status === 'pending'}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24">No owner expenses recorded yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <ExpenseDialog open={isExpenseDialogOpen} setOpen={setIsExpenseDialogOpen} expense={selectedExpense} categories={categories} onSuccess={loadData} defaultType="owner" />
            <CategoryManagerDialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen} onSuccess={loadData} expenseType="owner" />
            
             <Dialog open={isDeletionRequestDialogOpen} onOpenChange={setDeletionRequestDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Expense Deletion</DialogTitle>
                        <DialogDescription>
                            As you are not the owner, this deletion requires approval. Please provide a clear reason for this request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Deletion Reason</Label>
                            <Input
                                id="reason"
                                placeholder="e.g., Mistakenly entered duplicate expense"
                                value={deletionReason}
                                onChange={(e) => setDeletionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletionRequestDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRequestDeletion}>Submit for Approval</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default OwnerExpensesPage;