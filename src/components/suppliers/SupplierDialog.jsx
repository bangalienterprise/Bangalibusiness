import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/contexts/BusinessContext';

const supplierSchema = z.object({
    name: z.string().min(2, { message: "Supplier name must be at least 2 characters." }),
    contact_person: z.string().optional(),
    email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['Active', 'Inactive']),
    category: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    payment_terms: z.string().optional(),
});

const SupplierDialog = ({ open, onOpenChange, supplier, onSuccess }) => {
    const { toast } = useToast();
    const { activeBusiness } = useBusiness();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            status: 'Active',
            category: '',
            rating: 3,
            payment_terms: '',
        }
    });

    useEffect(() => {
        if (supplier) {
            reset({
                ...supplier,
                rating: supplier.rating || 3,
            });
        } else {
            reset({
                name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                status: 'Active',
                category: '',
                rating: 3,
                payment_terms: '',
            });
        }
    }, [supplier, reset, open]);

    const onSubmit = async (data) => {
        if (!activeBusiness) {
            toast({ title: "No active business selected", variant: "destructive" });
            return;
        }
        setLoading(true);

        const payload = {
            ...data,
            business_id: activeBusiness.id,
            rating: data.rating ? parseInt(data.rating, 10) : null,
        };

        let response;
        if (supplier) {
            response = await supabase.from('suppliers').update(payload).eq('id', supplier.id);
        } else {
            response = await supabase.from('suppliers').insert(payload);
        }

        setLoading(false);
        if (response.error) {
            toast({ title: `Error ${supplier ? 'updating' : 'adding'} supplier`, description: response.error.message, variant: "destructive" });
        } else {
            toast({ title: `Supplier ${supplier ? 'updated' : 'added'} successfully` });
            onSuccess();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogDescription>
                        {supplier ? 'Update the details for this supplier.' : 'Fill in the details for the new supplier.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="name">Supplier Name</Label><Input id="name" {...register('name')} /><p className="text-red-500 text-xs mt-1">{errors.name?.message}</p></div>
                        <div><Label htmlFor="contact_person">Contact Person</Label><Input id="contact_person" {...register('contact_person')} /><p className="text-red-500 text-xs mt-1">{errors.contact_person?.message}</p></div>
                        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} /><p className="text-red-500 text-xs mt-1">{errors.email?.message}</p></div>
                        <div><Label htmlFor="phone">Phone</Label><Input id="phone" {...register('phone')} /><p className="text-red-500 text-xs mt-1">{errors.phone?.message}</p></div>
                    </div>
                    <div><Label htmlFor="address">Address</Label><Textarea id="address" {...register('address')} /><p className="text-red-500 text-xs mt-1">{errors.address?.message}</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                             <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div><Label htmlFor="category">Category</Label><Input id="category" {...register('category')} placeholder="e.g., Raw Materials" /><p className="text-red-500 text-xs mt-1">{errors.category?.message}</p></div>
                        <div>
                            <Label htmlFor="rating">Rating (1-5)</Label>
                             <Controller
                                name="rating"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value || '3')}>
                                        <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                                        <SelectContent>{[1, 2, 3, 4, 5].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>)}</SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div><Label htmlFor="payment_terms">Payment Terms</Label><Input id="payment_terms" {...register('payment_terms')} placeholder="e.g., Net 30" /><p className="text-red-500 text-xs mt-1">{errors.payment_terms?.message}</p></div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Supplier'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SupplierDialog;