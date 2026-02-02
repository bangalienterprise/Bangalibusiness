import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import * as db from '@/lib/database';
import { useBusiness } from '@/contexts/BusinessContext';
import SellerSelector from './SellerSelector';

const customerSchema = z.object({
  name: z.string().min(2, { message: "Customer name must be at least 2 characters." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  address: z.string().optional(),
  assigned_seller_id: z.string().uuid().nullable().optional(),
});

const CustomerDialog = ({ open, onOpenChange, customer, onSuccess }) => {
  const { toast } = useToast();
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      assigned_seller_id: null,
    }
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        assigned_seller_id: customer.assigned_seller_id || null,
      });
    } else {
      reset({
        name: '',
        phone: '',
        email: '',
        address: '',
        assigned_seller_id: null,
      });
    }
  }, [customer, reset, open]);

  const onSubmit = async (data) => {
    if (!activeBusiness) {
      toast({ title: "No active business selected", variant: "destructive" });
      return;
    }
    setLoading(true);

    const payload = {
      ...data,
      business_id: activeBusiness.id,
      assigned_seller_id: data.assigned_seller_id === 'unassigned' ? null : data.assigned_seller_id
    };

    try {
        if (customer) {
            await db.updateCustomer(customer.id, payload);
        } else {
            await db.createCustomer(payload);
        }
        
        toast({ title: `Customer ${customer ? 'updated' : 'added'} successfully` });
        onSuccess();
        onOpenChange(false);
    } catch (error) {
        toast({ title: `Error ${customer ? 'updating' : 'adding'} customer`, description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Update the details for this customer.' : 'Fill in the details for the new customer.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><Label htmlFor="name">Customer Name</Label><Input id="name" {...register('name')} /><p className="text-red-500 text-xs mt-1">{errors.name?.message}</p></div>
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" {...register('phone')} /><p className="text-red-500 text-xs mt-1">{errors.phone?.message}</p></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} /><p className="text-red-500 text-xs mt-1">{errors.email?.message}</p></div>
          <div><Label htmlFor="address">Address</Label><Textarea id="address" {...register('address')} /><p className="text-red-500 text-xs mt-1">{errors.address?.message}</p></div>
          <div>
            <Label htmlFor="assigned_seller_id">Assign Seller</Label>
            <Controller
              name="assigned_seller_id"
              control={control}
              render={({ field }) => (
                <SellerSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Customer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;