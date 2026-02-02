import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { TrendingDown, Plus, Download, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const ExpenseManagement = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [expenses, setExpenses] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ description: '', amount: '', category: 'General', date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        loadExpenses();
    }, [user]);

    const loadExpenses = async () => {
        if (!user?.business_id) return;
        const data = await mockDatabase.getAll('expenses', user.business_id);
        setExpenses(data || []);
    };

    const handleSubmit = async () => {
        try {
            await mockDatabase.create('expenses', {
                ...formData,
                amount: parseFloat(formData.amount),
                business_id: user.business_id,
                created_by: user.id
            });
            setOpen(false);
            setFormData({ description: '', amount: '', category: 'General', date: new Date().toISOString().split('T')[0] });
            loadExpenses();
            toast({ title: "Expense Added" });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Expense Management</title></Helmet>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Expenses</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-500"><Plus className="mr-2 h-4 w-4"/> Add Expense</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader><DialogTitle>Record New Expense</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-slate-950 border-slate-700"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="bg-slate-950 border-slate-700"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                                        <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue/></SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800">
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Rent">Rent</SelectItem>
                                            <SelectItem value="Utilities">Utilities</SelectItem>
                                            <SelectItem value="Salary">Salary</SelectItem>
                                            <SelectItem value="Inventory">Inventory</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-slate-950 border-slate-700"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-rose-600 hover:bg-rose-500">Save Expense</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-rose-500"/> Expense History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-8">No expenses recorded yet.</TableCell></TableRow>
                            ) : (
                                expenses.map(exp => (
                                    <TableRow key={exp.id} className="border-slate-800">
                                        <TableCell className="text-white">{format(new Date(exp.date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="text-slate-300">{exp.description}</TableCell>
                                        <TableCell><span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300">{exp.category}</span></TableCell>
                                        <TableCell className="text-right font-medium text-white">৳{exp.amount}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpenseManagement;