import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import UserHoverCard from '@/components/users/UserHoverCard';
import SellerProfileDisplay from '@/components/users/SellerProfileDisplay';

const saleSchema = z.object({
  customer_id: z.string().uuid("Please select a customer."),
  seller_id: z.string().uuid("Please select a seller."),
  product_id: z.string().uuid("Please select a product."),
  quantity: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive("Quantity must be positive.")),
  unit_price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().nonnegative("Unit price cannot be negative.")),
  collected_amount: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().nonnegative("Collected amount cannot be negative.")),
  sale_date: z.date(),
  payment_method: z.string().min(1, "Payment method is required."),
  notes: z.string().optional(),
});

const MissingSellerSaleDialog = ({ open, onOpenChange, onSuccess, customers, sellers }) => {
  const { toast } = useToast();
  const { user: profile } = useAuth();
  const { activeBusiness } = useBusiness();
  const [products, setProducts] = useState([]);

  const { control, handleSubmit, register, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: { sale_date: new Date(), payment_method: 'Cash', quantity: 1, unit_price: 0, collected_amount: 0 }
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');
  const totalAmount = useMemo(() => (quantity || 0) * (unitPrice || 0), [quantity, unitPrice]);
  const collectedAmount = watch('collected_amount');
  const dueAmount = useMemo(() => totalAmount - (collectedAmount || 0), [totalAmount, collectedAmount]);
  const selectedProductId = watch('product_id');
  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);
  const selectedSellerId = watch('seller_id');
  const selectedSeller = useMemo(() => sellers.find(s => s.id === selectedSellerId), [sellers, selectedSellerId]);


  useEffect(() => {
    if (selectedProduct) {
        setValue('unit_price', selectedProduct.selling_price);
    }
  }, [selectedProduct, setValue]);

  useEffect(() => {
    if (activeBusiness) {
        const fetchProducts = async () => {
            const data = await db.getProducts(activeBusiness.id);
            setProducts(data || []);
        };
        fetchProducts();
    }
    if(!open) reset();
  }, [activeBusiness, open, reset]);

  const onSubmit = async (formData) => {
    if (!profile || !activeBusiness) return;

    if (!selectedProduct) {
        toast({ title: 'Product not selected', description: `Please select a product.`, variant: 'destructive' });
        return;
    }

    if (formData.quantity > selectedProduct.stock) {
        toast({ title: 'Insufficient Stock', description: `Only ${selectedProduct.stock} units available.`, variant: 'destructive' });
        return;
    }
    if (formData.collected_amount > totalAmount) {
        toast({ title: 'Invalid Amount', description: 'Collected amount cannot exceed total amount.', variant: 'destructive'});
        return;
    }

    try {
        await db.database.create('/sales/record-transaction', {
            sales_data: [{
                business_id: activeBusiness.id,
                product_id: formData.product_id,
                customer_id: formData.customer_id,
                seller_id: formData.seller_id,
                quantity: formData.quantity,
                unit_price: formData.unit_price,
                total_amount: totalAmount,
                sale_date: format(formData.sale_date, 'yyyy-MM-dd'),
                payment_method: formData.payment_method,
                notes: formData.notes,
                created_by: profile.id
            }],
            total_collected: formData.collected_amount,
            customer_id_in: formData.customer_id
        });

        toast({ title: 'Sale Recorded Successfully!' });
        onSuccess();
        onOpenChange(false);
    } catch (error) {
        toast({ title: 'Sale Failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Missing Seller Sale</DialogTitle>
          <DialogDescription>Manually record a sale when the original seller is unavailable or unassigned.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="space-y-1">
              <Label>Customer</Label>
              <Controller name="customer_id" control={control} render={({ field }) => (
                <Popover><PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{field.value ? customers.find(c => c.id === field.value)?.name : "Select customer..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search customer..." /><CommandList><CommandEmpty>No customer found.</CommandEmpty><CommandGroup>{customers.map(c => <CommandItem key={c.id} value={c.name} onSelect={() => setValue('customer_id', c.id, { shouldValidate: true })}><Check className={cn("mr-2 h-4 w-4", field.value === c.id ? "opacity-100" : "opacity-0")} />{c.name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
              )}/>
              {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id.message}</p>}
            </div>
            {/* Seller */}
            <div className="space-y-1">
              <Label>Original Seller</Label>
              <Controller name="seller_id" control={control} render={({ field }) => (
                <Popover><PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-start h-auto text-left">
                        {selectedSeller ? <SellerProfileDisplay user={selectedSeller} /> : <div className="flex justify-between w-full items-center"><span>Select seller...</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></div>}
                    </Button>
                </PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search seller..." /><CommandList><CommandEmpty>No seller found.</CommandEmpty><CommandGroup>{sellers.map(s => <CommandItem key={s.id} value={s.username} onSelect={() => setValue('seller_id', s.id, { shouldValidate: true })}><Check className={cn("mr-2 h-4 w-4", field.value === s.id ? "opacity-100" : "opacity-0")} />
                <UserHoverCard user={s}><div>{s.username} ({s.full_name})<p className="text-xs text-muted-foreground capitalize">{s.role?.replace('_', ' ')}</p></div></UserHoverCard></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
              )}/>
              {errors.seller_id && <p className="text-xs text-destructive">{errors.seller_id.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product */}
            <div className="space-y-1 md:col-span-3">
              <Label>Product</Label>
               <Controller name="product_id" control={control} render={({ field }) => (
                <Popover><PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{field.value ? products.find(p => p.id === field.value)?.name : "Select product..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search product..." /><CommandList><CommandEmpty>No product found.</CommandEmpty><CommandGroup>{products.map(p => <CommandItem key={p.id} value={p.name} onSelect={() => setValue('product_id', p.id, { shouldValidate: true })}><Check className={cn("mr-2 h-4 w-4", field.value === p.id ? "opacity-100" : "opacity-0")} />{p.name} (Stock: {p.stock})</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover>
              )}/>
              {errors.product_id && <p className="text-xs text-destructive">{errors.product_id.message}</p>}
            </div>
            {/* Quantity */}
            <div className="space-y-1"><Label>Quantity</Label><Input type="number" {...register('quantity')} /><p className="text-xs text-muted-foreground">Stock: {selectedProduct?.stock || 'N/A'}</p>{errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}</div>
            {/* Unit Price */}
            <div className="space-y-1"><Label>Unit Price (৳)</Label><Input type="number" step="0.01" {...register('unit_price')} />{errors.unit_price && <p className="text-xs text-destructive">{errors.unit_price.message}</p>}</div>
            {/* Collected Amount */}
            <div className="space-y-1"><Label>Collected Amount (৳)</Label><Input type="number" step="0.01" {...register('collected_amount')} />{errors.collected_amount && <p className="text-xs text-destructive">{errors.collected_amount.message}</p>}</div>
          </div>
          
          <div className='bg-secondary/50 rounded-lg p-3 grid grid-cols-3 text-center'>
            <div><p className='text-sm text-muted-foreground'>Total Amount</p><p className='font-bold text-lg'>৳{totalAmount.toFixed(2)}</p></div>
            <div><p className='text-sm text-muted-foreground'>Collected</p><p className='font-bold text-lg text-green-500'>৳{(collectedAmount || 0).toFixed(2)}</p></div>
            <div><p className='text-sm text-muted-foreground'>Due Amount</p><p className='font-bold text-lg text-red-500'>৳{dueAmount.toFixed(2)}</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Payment Method */}
             <div className="space-y-1">
              <Label>Payment Method</Label>
              <Controller name="payment_method" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank">Bank</SelectItem></SelectContent></Select>
              )}/>
              {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method.message}</p>}
            </div>
             {/* Sale Date */}
            <div className="space-y-1">
              <Label>Sale Date</Label>
               <Controller name="sale_date" control={control} render={({ field }) => (
                <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
              )}/>
               {errors.sale_date && <p className="text-xs text-destructive">{errors.sale_date.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes (Optional)</Label>
            <Textarea {...register('notes')} placeholder="Any additional notes about this sale..."/>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Recording..." : "Record Sale"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MissingSellerSaleDialog;