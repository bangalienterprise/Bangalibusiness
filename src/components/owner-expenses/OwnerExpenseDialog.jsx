import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OwnerExpenseDialog = ({ open, setOpen, onSave, expense, categories }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        if (expense) {
            setDescription(expense.description);
            setAmount(expense.amount);
            setDate(expense.date);
            setCategoryId(expense.categoryId);
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategoryId('');
        }
    }, [expense, open]);

    const handleSave = () => {
        onSave({
            id: expense?.id,
            description,
            amount: parseFloat(amount),
            date,
            categoryId
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] glassmorphic">
                <DialogHeader>
                    <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                    <DialogDescription>
                        {expense ? 'Update the details of your personal expense.' : 'Add a new personal expense to your records.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OwnerExpenseDialog;