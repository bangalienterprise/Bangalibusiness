import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createCollection, updateSale } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const CollectDueDialog = ({ sale, isOpen, onClose, onSuccess }) => {
    const { toast } = useToast();
    const { user: profile } = useAuth();
    const [loading, setLoading] = useState(false);

    const dueAmount = sale ? (sale.final_amount - sale.amount_paid) : 0;

    const schema = z.object({
        amount_collected: z.number()
            .min(0.01, "Amount must be positive.")
            .max(dueAmount + 0.01, `Amount cannot exceed the due amount of ৳${dueAmount.toLocaleString()}.`),
        payment_method: z.string().min(1, "Payment method is required."),
        collection_date: z.date({ required_error: 'Collection date is required.' }),
        notes: z.string().optional(),
    });

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            amount_collected: dueAmount,
            payment_method: 'cash',
            collection_date: new Date(),
            notes: ''
        }
    });

    const onSubmit = async (data) => {
        if (!sale || !profile) return;
        setLoading(true);
        try {
            await createCollection({
                sale_id: sale.id,
                business_id: sale.business_id,
                collected_by: profile.id,
                amount_collected: data.amount_collected,
                collection_date: format(data.collection_date, 'yyyy-MM-dd'),
                payment_method: data.payment_method,
                notes: data.notes
            });

            const newAmountPaid = sale.amount_paid + data.amount_collected;
            await updateSale(sale.id, { amount_paid: newAmountPaid });

            toast({ title: 'Payment Collected!', description: `৳${data.amount_collected.toLocaleString()} has been successfully recorded.` });
            onSuccess();
            onClose();
        } catch (error) {
            toast({ title: 'Error collecting payment', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (!sale) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collect Due Payment</DialogTitle>
                    <DialogDescription>
                        Collecting payment for sale to <span className="font-semibold">{sale.customer?.name || 'Unknown Customer'}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center text-sm">
                        <span>Total Sale Amount:</span>
                        <span className="font-mono">৳{sale.final_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                        <span>Already Paid:</span>
                        <span className="font-mono">৳{sale.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-lg mt-2 text-destructive">
                        <span>Outstanding Due:</span>
                        <span className="font-mono">৳{dueAmount.toLocaleString()}</span>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="amount_collected">Amount to Collect</Label>
                            <Input id="amount_collected" type="number" step="0.01" {...register('amount_collected', { valueAsNumber: true })} />
                            {errors.amount_collected && <p className="text-red-500 text-xs mt-1">{errors.amount_collected.message}</p>}
                        </div>
                        <div>
                            <Label>Payment Method</Label>
                            <Controller name="payment_method" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                            {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method.message}</p>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" {...register('notes')} placeholder="Optional: Add a note about this collection..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Collect Payment'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CollectDueDialog;