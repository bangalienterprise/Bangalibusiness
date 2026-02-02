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
import { updateCollection } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

const EditCollectionDialog = ({ collection, isOpen, onClose }) => {
    const { toast } = useToast();
    const { user: profile } = useAuth();
    const { refreshData } = useBusiness();
    const [loading, setLoading] = useState(false);

    const schema = z.object({
        amount_collected: z.number().min(0.01, "Amount must be positive."),
        payment_method: z.string().min(1, "Payment method is required."),
        collection_date: z.string().min(1, "Date is required"),
        notes: z.string().optional(),
    });

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            amount_collected: collection.amount_collected,
            payment_method: collection.payment_method,
            collection_date: collection.collection_date,
            notes: collection.notes || ''
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await updateCollection(collection.id, {
                amount_collected: data.amount_collected,
                payment_method: data.payment_method,
                collection_date: data.collection_date,
                notes: data.notes,
                updated_by: profile.id
            });

            toast({ title: 'Success', description: 'Collection updated successfully.' });
            refreshData();
            onClose();
        } catch (error) {
            toast({ title: 'Error updating collection', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                    <DialogDescription>Update payment details. This will automatically adjust the sale balance.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount_collected">Amount</Label>
                            <Input id="amount_collected" type="number" step="0.01" {...register('amount_collected', { valueAsNumber: true })} />
                            {errors.amount_collected && <p className="text-red-500 text-xs mt-1">{errors.amount_collected.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="collection_date">Date</Label>
                            <Input id="collection_date" type="date" {...register('collection_date')} />
                            {errors.collection_date && <p className="text-red-500 text-xs mt-1">{errors.collection_date.message}</p>}
                        </div>
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
                                    <SelectItem value="check">Check</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" {...register('notes')} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Collection'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCollectionDialog;