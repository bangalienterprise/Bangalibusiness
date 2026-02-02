
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Plus, Trash2, TrendingDown, Calendar, Loader2 } from 'lucide-react';

const ExpensesPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        amount: '', category: 'Other', note: '', date: format(new Date(), 'yyyy-MM-dd')
    });

    const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Supplies', 'Maintenance', 'Transportation', 'Insurance', 'Other'];

    useEffect(() => {
        if (business?.id) {
            fetchExpenses();
        }
    }, [business]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('business_id', business.id)
                .order('date', { ascending: false });
            if (error) throw error;
            setExpenses(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load expenses" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from('expenses').insert({
                business_id: business.id,
                ...formData
            });
            if (error) throw error;
            
            toast({ title: "Expense recorded" });
            setIsDialogOpen(false);
            setFormData({ amount: '', category: 'Other', note: '', date: format(new Date(), 'yyyy-MM-dd') });
            fetchExpenses();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to save expense" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this expense record?")) return;
        try {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Expense deleted" });
            fetchExpenses();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Expenses - Bangali Enterprise</title></Helmet>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Expenses</h1>
                    <p className="text-slate-400">Track business spending.</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <div>
                            <div className="text-xs text-slate-400">Total Spent</div>
                            <div className="text-lg font-bold text-red-500">৳{totalExpenses}</div>
                        </div>
                     </div>
                     <Button onClick={() => setIsDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Category</TableHead>
                            <TableHead className="text-slate-400">Description</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No expenses recorded</TableCell></TableRow>
                        ) : (
                            expenses.map(expense => (
                                <TableRow key={expense.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            {format(new Date(expense.date), 'MMM d, yyyy')}
                                        </div>
                                    </TableCell>
                                    <TableCell><span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">{expense.category}</span></TableCell>
                                    <TableCell className="text-slate-400 max-w-[200px] truncate">{expense.note || '-'}</TableCell>
                                    <TableCell className="font-medium text-red-400">৳{expense.amount}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="text-slate-500 hover:text-red-400 hover:bg-red-900/20">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-slate-900 border-slate-700 dark:[color-scheme:dark]" />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.category} onValueChange={val => setFormData({...formData, category: val})}>
                                <SelectTrigger className="bg-slate-900 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Input value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="bg-slate-900 border-slate-700" placeholder="e.g. Office rent for July" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-slate-700 text-white">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                                {saving ? 'Saving...' : 'Save Expense'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExpensesPage;
