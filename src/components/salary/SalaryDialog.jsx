import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import * as db from '@/lib/database';
import { useBusiness } from '@/contexts/BusinessContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

const SalaryDialog = ({ open, onOpenChange, onSuccess }) => {
    const { toast } = useToast();
    const { activeBusiness } = useBusiness();
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        payment_date: new Date(),
        payment_method: 'Cash',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!activeBusiness) return;
            try {
                // Assuming db.database.get supports querying profiles
                const data = await db.database.get('/users', { params: { business_id: activeBusiness.id } });
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        if (open) {
            fetchUsers();
            setFormData({
                user_id: '',
                amount: '',
                payment_date: new Date(),
                payment_method: 'Cash',
                notes: ''
            });
        }
    }, [open, activeBusiness]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeBusiness || !formData.user_id || !formData.amount) {
            toast({ title: 'Missing Information', description: 'Please select an employee and enter an amount.', variant: 'destructive' });
            return;
        }
        setLoading(true);

        try {
            await db.database.create('/salaries', {
                business_id: activeBusiness.id,
                user_id: formData.user_id,
                amount: parseFloat(formData.amount),
                payment_date: formData.payment_date,
                payment_method: formData.payment_method,
                notes: formData.notes,
                recorded_by: authUser.id,
            });
            
            toast({ title: 'Salary Recorded', description: 'The salary payment has been successfully recorded.' });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Error Recording Salary', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const selectedUserDetails = users.find(u => u.id === formData.user_id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Record Salary Payment</DialogTitle>
                    <DialogDescription>Enter the details for the salary payment.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">Employee</Label>
                        <Select required value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                            <SelectTrigger id="user"><SelectValue placeholder="Select an employee" /></SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.username} ({user.full_name || 'No name'}) - <span className="capitalize text-muted-foreground">{user.role?.replace(/_/g, ' ')}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         {selectedUserDetails && (
                            <div className="text-xs text-muted-foreground p-2 bg-secondary rounded-md">
                                <p><strong>Full Name:</strong> {selectedUserDetails.full_name}</p>
                                <p><strong>Role:</strong> <span className="capitalize">{selectedUserDetails.role?.replace(/_/g, ' ')}</span></p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (৳)</Label>
                        <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment_date">Payment Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.payment_date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.payment_date ? format(formData.payment_date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.payment_date} onSelect={(date) => setFormData({ ...formData, payment_date: date })} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method</Label>
                            <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                                <SelectTrigger id="payment_method"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="E.g., Monthly salary, bonus..." />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Payment'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SalaryDialog;