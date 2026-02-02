import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronsUpDown, Check, Briefcase, Tag, Package, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import SellerProfileDisplay from '@/components/users/SellerProfileDisplay';

const saleSchema = z.object({
  seller_id: z.string().uuid('Please select a seller.'),
  product_id: z.string().uuid('Please select a product.'),
  customer_id: z.string().uuid('Please select a customer.'),
  quantity: z.number().min(1, 'Quantity must be at least 1.'),
  collected_amount: z.number().min(0, 'Collected amount cannot be negative.'),
  sale_date: z.date({ required_error: 'Sale date is required.' }),
  payment_method: z.string().min(1, 'Payment method is required.'),
});

const SalesDialog = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const { activeBusiness } = useBusiness();
  const { profile } = useAuth();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      seller_id: undefined,
      product_id: undefined,
      customer_id: undefined,
      quantity: 1,
      collected_amount: 0,
      sale_date: new Date(),
      payment_method: 'cash',
    }
  });

  const fetchData = useCallback(async () => {
    if (!activeBusiness?.id) return;
    setLoading(true);
    try {
      const [usersRes, productsRes, customersRes] = await Promise.all([
        supabase.rpc('get_all_users_with_details'),
        supabase.from('products').select('*').eq('business_id', activeBusiness.id),
        supabase.from('customers').select('*').eq('business_id', activeBusiness.id),
      ]);
      if (usersRes.error) throw usersRes.error;
      setUsers(usersRes.data || []);
      if (productsRes.error) throw productsRes.error;
      setProducts(productsRes.data || []);
      if (customersRes.error) throw customersRes.error;
      setCustomers(customersRes.data || []);
    } catch (error) {
      toast({ title: 'Error fetching data', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness, toast]);

  useEffect(() => {
    if (open) {
      fetchData();
      reset({
        seller_id: profile?.id,
        product_id: undefined,
        customer_id: undefined,
        quantity: 1,
        collected_amount: 0,
        sale_date: new Date(),
        payment_method: 'cash',
      });
    }
  }, [open, fetchData, reset, profile]);

  const selectedSellerId = watch('seller_id');
  const selectedProductId = watch('product_id');
  const selectedCustomerId = watch('customer_id');
  const quantity = watch('quantity');
  
  const selectedSeller = useMemo(() => users.find(u => u.id === selectedSellerId), [users, selectedSellerId]);
  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);
  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);
  
  const totalAmount = useMemo(() => selectedProduct ? (quantity || 0) * selectedProduct.selling_price : 0, [selectedProduct, quantity]);
  const dueAmount = useMemo(() => totalAmount - (watch('collected_amount') || 0), [totalAmount, watch('collected_amount')]);
  const profit = useMemo(() => selectedProduct ? (quantity || 0) * (selectedProduct.selling_price - selectedProduct.cost_price) : 0, [selectedProduct, quantity]);
  
  const onSubmit = async (formData) => {
    if (quantity > selectedProduct.stock) {
      toast({ title: 'Insufficient Stock', description: `Only ${selectedProduct.stock} units available.`, variant: 'destructive' });
      return;
    }
    const saleData = {
        ...formData,
        business_id: activeBusiness.id,
        unit_price: selectedProduct.selling_price,
        total_amount: totalAmount,
        sale_date: format(formData.sale_date, 'yyyy-MM-dd'),
    };
    
    const { error } = await supabase.from('sales').insert(saleData);

    if (error) {
        toast({ title: 'Error recording sale', description: error.message, variant: 'destructive' });
    } else {
        const { error: stockError } = await supabase.from('products').update({ stock: selectedProduct.stock - quantity }).eq('id', selectedProduct.id);
        if (stockError) {
             toast({ title: 'Sale recorded, but failed to update stock', description: stockError.message, variant: 'destructive' });
        } else {
             toast({ title: 'Sale Recorded Successfully!' });
        }
        onSuccess();
        onOpenChange(false);
    }
  };

  const UserListItem = ({ user, field }) => (
    <div className='flex items-center gap-3 w-full'>
      {field && <Check className={cn("mr-2 h-4 w-4", field.value === user.id ? "opacity-100" : "opacity-0")} />}
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold text-sm">{user.full_name || user.username}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Badge variant="outline" className="capitalize text-xs">{user.role?.replace(/_/g, ' ')}</Badge>
    </div>
  );

  if (loading) return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Loading...</DialogTitle></DialogHeader><div className="py-12 text-center">Loading sale data...</div></DialogContent></Dialog>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
          <DialogDescription>Fill in the details to record a new sales transaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="space-y-2">
              <Label>Seller</Label>
              <Controller name="seller_id" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{selectedSeller ? <UserListItem user={selectedSeller} /> : "Select a seller..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search sellers..." /><CommandList><CommandEmpty>No seller found.</CommandEmpty><CommandGroup>
                    {users.map(u => (<CommandItem key={u.id} value={`${u.full_name || u.username} ${u.email}`} onSelect={() => setValue('seller_id', u.id, { shouldValidate: true })}><UserListItem user={u} field={field} /></CommandItem>))}
                  </CommandGroup></CommandList></Command></PopoverContent>
                </Popover>
              )}/>
              {errors.seller_id && <p className="text-xs text-destructive">{errors.seller_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Product</Label>
              <Controller name="product_id" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{selectedProduct ? <><Package className="mr-2 h-4 w-4" />{selectedProduct.name}</> : "Select a product..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search products..." /><CommandList><CommandEmpty>No product found.</CommandEmpty><CommandGroup>
                    {products.map(p => (<CommandItem key={p.id} value={p.name} onSelect={() => setValue('product_id', p.id, { shouldValidate: true })}>
                      <Check className={cn("mr-2 h-4 w-4", field.value === p.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex-1"><span>{p.name}</span><span className="text-xs text-muted-foreground ml-2">({p.stock} left)</span></div>
                      <span className="text-xs font-mono">৳{p.selling_price}</span>
                    </CommandItem>))}
                  </CommandGroup></CommandList></Command></PopoverContent>
                </Popover>
              )}/>
              {errors.product_id && <p className="text-xs text-destructive">{errors.product_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
              <Controller name="customer_id" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between">{selectedCustomer ? <><Briefcase className="mr-2 h-4 w-4" />{selectedCustomer.name}</> : "Select a customer..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search customers..." /><CommandList><CommandEmpty>No customer found.</CommandEmpty><CommandGroup>
                    {customers.map(c => (<CommandItem key={c.id} value={`${c.name} ${c.email || ''} ${c.phone || ''}`} onSelect={() => setValue('customer_id', c.id, { shouldValidate: true })}>
                      <Check className={cn("mr-2 h-4 w-4", field.value === c.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><div><p>{c.name}</p><p className="text-xs text-muted-foreground">{c.email || c.phone}</p></div></div>
                    </CommandItem>))}
                  </CommandGroup></CommandList></Command></PopoverContent>
                </Popover>
              )}/>
              {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id.message}</p>}
            </div>
          </div>
          
          {selectedSeller && <div className="border rounded-lg bg-secondary/30 mt-4"><SellerProfileDisplay user={selectedSeller} /></div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...control.register('quantity', { valueAsNumber: true })} />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collected_amount">Amount Collected</Label>
              <Input id="collected_amount" type="number" step="0.01" {...control.register('collected_amount', { valueAsNumber: true })} />
              {errors.collected_amount && <p className="text-xs text-destructive">{errors.collected_amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Controller name="payment_method" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              )}/>
               {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Sale Date</Label>
              <Controller name="sale_date" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><Calendar className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
              )}/>
              {errors.sale_date && <p className="text-xs text-destructive">{errors.sale_date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">৳{totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-sm text-muted-foreground">Due Amount</p>
                  <p className="text-lg font-bold text-destructive">৳{dueAmount.toLocaleString()}</p>
              </div>
               <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-sm text-muted-foreground">Profit</p>
                  <p className="text-lg font-bold text-green-500">৳{profit.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-sm text-muted-foreground">Stock Left</p>
                  <p className="text-lg font-bold">{selectedProduct ? selectedProduct.stock - (quantity || 0) : 'N/A'}</p>
              </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Recording Sale...' : 'Record Sale'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDialog;