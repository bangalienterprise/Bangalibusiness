import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar as CalendarIcon, ChevronsUpDown, Check, Package, Trash2, ShoppingCart, User, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SellerProfileDisplay from '@/components/users/SellerProfileDisplay';
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const saleSchema = z.object({
  seller_id: z.string().uuid('Please select a seller.'),
  customer_id: z.string().uuid('Please select a customer.').optional().nullable(),
  cart: z.array(z.object({
    product_id: z.string().uuid(),
    name: z.string(),
    quantity: z.number().min(1, 'Min 1'),
    unit_price: z.number(),
    cost_price: z.number(),
    total_amount: z.number(),
    stock: z.number()
  })).min(1, 'Please add at least one product to the cart.'),
  collected_amount: z.number().min(0, 'Collected amount cannot be negative.'),
  sale_date: z.date({ required_error: 'Sale date is required.' }),
  payment_method: z.string().min(1, 'Payment method is required.'),
  notes: z.string().optional()
});

const MultiStepSalesDialog = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const { user: profile, hasPermission } = useAuth();
  const { activeBusiness, customers, products, sellers, refreshData } = useBusiness();
  const [salesHistory, setSalesHistory] = useState([]);

  const [step, setStep] = useState(1);
  const [customerStats, setCustomerStats] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  const { control, handleSubmit, watch, setValue, getValues, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      seller_id: profile?.id,
      customer_id: null,
      cart: [],
      collected_amount: 0,
      sale_date: new Date(),
      payment_method: 'cash',
      notes: ''
    }
  });

  const { fields: cartFields, append, remove, update } = useFieldArray({ control, name: "cart" });

  const watchCart = watch('cart');
  const watchCustomerId = watch('customer_id');
  const watchSellerId = watch('seller_id');
  const canSelectSeller = hasPermission('manage_sales');

  useEffect(() => {
    if(open && profile?.id) {
      if (!getValues('seller_id')) {
          setValue('seller_id', profile.id);
      }
    }
  }, [open, profile, setValue, getValues]);

  const selectedSeller = useMemo(() => sellers.find(s => s.id === watchSellerId), [sellers, watchSellerId]);

  const availableCustomers = useMemo(() => {
    if (!customers) return [];
    return customers; 
  }, [customers, watchSellerId]);

  const cartSummary = useMemo(() => {
    const summary = watchCart.reduce((acc, item) => {
      acc.totalAmount += item.total_amount;
      acc.totalCost += item.quantity * item.cost_price;
      acc.totalItems += item.quantity;
      return acc;
    }, { totalAmount: 0, totalCost: 0, totalItems: 0 });
    summary.totalProfit = summary.totalAmount - summary.totalCost;
    summary.profitMargin = summary.totalAmount > 0 ? (summary.totalProfit / summary.totalAmount) * 100 : 0;
    return summary;
  }, [watchCart]);
  
  const fetchCustomerSales = useCallback(async (customerId) => {
      if (!customerId) return;
      try {
          const data = await db.database.get('/sales', { params: { customer_id: customerId } });
          setSalesHistory(data || []);
      } catch (error) {
          console.error("Error fetching customer sales:", error);
      }
  }, []);


  useEffect(() => {
    if (open) {
        reset({
          seller_id: profile?.id,
          customer_id: null,
          cart: [],
          collected_amount: 0,
          sale_date: new Date(),
          payment_method: 'cash',
          notes: ''
        });
        setStep(1);
        setCustomerStats(null);
    }
  }, [open, reset, profile]);

  useEffect(() => {
    if (watchCustomerId) {
        fetchCustomerSales(watchCustomerId);
    } else {
        setSalesHistory([]);
        setCustomerStats(null);
    }
  }, [watchCustomerId, fetchCustomerSales]);

  useEffect(() => {
    if (!watchCustomerId || salesHistory.length === 0) {
      setCustomerStats(null);
      return;
    }
    const stats = salesHistory.reduce((acc, sale) => {
      acc.total_spent += sale.final_amount || 0;
      acc.total_due += (sale.final_amount || 0) - (sale.amount_paid || 0);
      return acc;
    }, { total_spent: 0, total_due: 0 });
    setCustomerStats(stats);
  }, [watchCustomerId, salesHistory]);

  const selectedCustomer = useMemo(() => {
    if (!customers || !watchCustomerId) return null;
    return customers.find(c => c.id === watchCustomerId);
  }, [customers, watchCustomerId]);


  const nextStep = () => {
    if (step === 1) {
        if (!getValues('customer_id')) {
             toast({ title: "Validation Error", description: "Please select a customer.", variant: "destructive" });
             return;
        }
    }
    if (step === 2 && getValues('cart').length === 0) {
        toast({ title: "Validation Error", description: "Your cart is empty.", variant: "destructive" });
        return;
    }
    setStep(s => Math.min(s + 1, 3));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleAddToCart = (product, quantity = 1) => {
    if (quantity <= 0) return;
    if (quantity > product.stock) {
        toast({ title: "Insufficient Stock", description: `Only ${product.stock} units available.`, variant: "destructive"});
        return;
    }
    const existingIndex = cartFields.findIndex(item => item.product_id === product.id);
    if (existingIndex > -1) {
        const currentQty = cartFields[existingIndex].quantity;
        const newQuantity = currentQty + quantity;
        
        if(newQuantity > product.stock) {
            toast({ title: "Insufficient Stock", description: `Cannot add more. Total would be ${newQuantity}, but only ${product.stock} available.`, variant: "destructive"});
            return;
        }
        update(existingIndex, {
            ...cartFields[existingIndex], 
            quantity: newQuantity, 
            total_amount: newQuantity * product.selling_price 
        });
    } else {
        append({
            product_id: product.id,
            name: product.name,
            quantity: quantity,
            unit_price: product.selling_price,
            cost_price: product.cost_price,
            total_amount: quantity * product.selling_price,
            stock: product.stock
        });
    }
     toast({ title: "Product Added", description: `${quantity} x ${product.name} added to cart.`});
  };

  const handleUpdateCart = (index, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity < 1) {
        if (newQuantity === 0) remove(index);
        return;
    }
    const item = cartFields[index];
    if (newQuantity > item.stock) {
        toast({ title: "Insufficient Stock", description: `Only ${item.stock} units available.`, variant: "destructive"});
        update(index, { ...item, quantity: item.stock, total_amount: item.stock * item.unit_price });
        return;
    }
    update(index, { ...item, quantity: newQuantity, total_amount: newQuantity * item.unit_price });
  };
  
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const lowerSearch = productSearch.toLowerCase();
    return products.filter(p => 
        (p.name.toLowerCase().includes(lowerSearch) || p.category?.toLowerCase().includes(lowerSearch)) 
        && p.stock > 0
    );
  }, [products, productSearch]);

  const onSubmit = async (formData) => {
     if (!activeBusiness?.id || !formData.seller_id) {
        toast({ title: 'Error', description: 'Business or seller not found.', variant: 'destructive' });
        return;
    }

    try {
        await db.database.create('/sales/record-transaction', {
          p_business_id: activeBusiness.id,
          p_customer_id: formData.customer_id,
          p_seller_id: formData.seller_id,
          p_sale_date: format(formData.sale_date, 'yyyy-MM-dd'),
          p_amount_paid: formData.collected_amount,
          p_payment_method: formData.payment_method,
          p_notes: formData.notes,
          p_sale_items: formData.cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        });
    
        toast({ title: 'Sale Recorded Successfully!', description: 'Inventory has been updated.' });
        refreshData(); 
        onSuccess();
        onOpenChange(false);
    } catch (error) {
        console.error("Sale submission error:", error);
        toast({ title: 'Error recording sale', description: error.message, variant: 'destructive' });
    }
  };

  const dueAmount = cartSummary.totalAmount - (watch('collected_amount') || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Create New Sale</DialogTitle>
          <DialogDescription>Follow the steps to record a new sales transaction.</DialogDescription>
          <div className="flex items-center pt-4">
              {[1, 2, 3].map(s => (
                  <React.Fragment key={s}>
                      <div className="flex items-center">
                          <div className={cn("rounded-full h-8 w-8 flex items-center justify-center font-bold text-white transition-colors", step >= s ? "bg-primary" : "bg-muted text-muted-foreground")}>{s}</div>
                          <p className={cn("ml-2 font-medium hidden sm:block", step >= s ? "text-primary" : "text-muted-foreground")}>
                              {s === 1 ? 'Customer' : s === 2 ? 'Products' : 'Payment'}
                          </p>
                      </div>
                      {s < 3 && <div className={cn("flex-auto border-t-2 mx-4 transition-colors", step > s ? "border-primary" : "border-muted")}></div>}
                  </React.Fragment>
              ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          <div className="col-span-1 md:col-span-2 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Step 1: Select Seller & Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Seller</Label>
                    <Controller name="seller_id" control={control} render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild disabled={!canSelectSeller}>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                            {selectedSeller ? <div className="flex items-center gap-2"><User className="h-4 w-4" />{selectedSeller.full_name || selectedSeller.username}</div> : "Select seller..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search sellers..." />
                                <CommandList>
                                    <CommandEmpty>No sellers found.</CommandEmpty>
                                    <CommandGroup>
                                    {(sellers || []).map(s => (
                                        <CommandItem key={s.id} value={`${s.full_name || s.username} ${s.email}`} onSelect={() => {setValue('seller_id', s.id, { shouldValidate: true }); setValue('customer_id', null);}}>
                                        <Check className={cn("mr-2 h-4 w-4", field.value === s.id ? "opacity-100" : "opacity-0")} />
                                        {s.full_name || s.username}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                      </Popover>
                    )} />
                    {errors.seller_id && <p className="text-xs text-destructive">{errors.seller_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Customer</Label>
                    <Controller name="customer_id" control={control} render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                            {selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.phone || 'No Phone'}` : "Select a customer..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search customers..." />
                                <CommandList>
                                    <CommandEmpty>No customer found.</CommandEmpty>
                                    <CommandGroup>
                                    {availableCustomers.map(c => (
                                        <CommandItem key={c.id} value={`${c.name} ${c.email || ''} ${c.phone || ''}`} onSelect={() => setValue('customer_id', c.id, { shouldValidate: true })}>
                                        <Check className={cn("mr-2 h-4 w-4", field.value === c.id ? "opacity-100" : "opacity-0")} />
                                        <div className="flex flex-col">
                                            <span>{c.name}</span>
                                            <span className="text-xs text-muted-foreground">{c.phone}</span>
                                        </div>
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                      </Popover>
                    )} />
                    {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id.message}</p>}
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="p-4 border rounded-lg bg-secondary/30 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 text-xl">
                            <AvatarFallback>{selectedCustomer.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-bold text-lg">{selectedCustomer.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                          <p className="font-mono font-semibold">৳{customerStats?.total_spent.toLocaleString() || '0'}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total Due</p>
                          <p className={cn("font-mono font-semibold", (customerStats?.total_due || 0) > 0 ? "text-destructive" : "text-green-600")}>
                              ৳{customerStats?.total_due.toLocaleString() || '0'}
                          </p>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6 h-full flex flex-col">
                <h3 className="font-semibold text-lg flex-none">Step 2: Add Products to Cart</h3>
                 <div className="relative flex-none">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products by name or category..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-10"/>
                </div>
                <div className="flex-1 overflow-y-auto border rounded-lg mt-4">
                    {filteredProducts.length > 0 ? (
                        <ul className="divide-y">
                            {filteredProducts.map(p => (
                                <li key={p.id} className="p-3 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium">{p.name}</p>
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                            <span className="bg-secondary px-1.5 py-0.5 rounded">{p.category}</span>
                                            <span className="font-mono">৳{p.selling_price}</span>
                                            <span className={cn(p.stock > 10 ? 'text-green-600' : 'text-amber-600 font-bold')}>Stock: {p.stock}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => handleAddToCart(p)} disabled={p.stock <= 0}>
                                        {p.stock <= 0 ? 'Out of Stock' : 'Add'}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                            <Package className="h-12 w-12 mb-2 opacity-20" />
                            <p>No products found.</p>
                        </div>
                    )}
                </div>
              </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Step 3: Payment & Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Payment Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="collected_amount">Amount Collected</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                                        <Controller name="collected_amount" control={control} render={({ field }) => 
                                            <Input id="collected_amount" type="number" step="0.01" className="pl-8 font-mono text-lg" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        } />
                                    </div>
                                    {errors.collected_amount && <p className="text-xs text-destructive">{errors.collected_amount.message}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Controller name="payment_method" control={control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="card">Card</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="mobile_banking">Mobile Banking (Bkash/Nagad)</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}/>
                                    {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Sale Date</Label>
                                    <Controller name="sale_date" control={control} render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                        </Popover>
                                    )}/>
                                    {errors.sale_date && <p className="text-xs text-destructive">{errors.sale_date.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border bg-card shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Total Bill</span>
                                    <span className="text-xl font-bold font-mono">৳{cartSummary.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Paid</span>
                                    <span className="text-lg font-bold font-mono text-green-600">৳{(watch('collected_amount') || 0).toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Due Amount</span>
                                    <span className={cn("text-xl font-bold font-mono", dueAmount > 0 ? "text-destructive" : "text-muted-foreground")}>
                                        ৳{dueAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Controller name="notes" control={control} render={({ field }) => 
                                    <Textarea id="notes" {...field} placeholder="Add any notes for this sale..." className="h-24 resize-none"/>
                                } />
                            </div>
                        </div>
                    </div>
                    
                    {dueAmount > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Outstanding Balance</AlertTitle>
                            <AlertDescription>
                                This transaction will result in a due balance of ৳{dueAmount.toLocaleString()} for the customer.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
          </div>
          
          <div className="col-span-1 border-l bg-secondary/10 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b bg-secondary/20">
                <h3 className="font-semibold flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Cart Summary</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cartFields.length > 0 ? (
                <ul className="space-y-3">
                    {cartFields.map((item, index) => (
                        <li key={item.id} className="flex flex-col gap-2 bg-card p-3 rounded-md border shadow-sm">
                            <div className="flex justify-between items-start">
                                <span className="font-medium text-sm line-clamp-2">{item.name}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                                    <Trash2 className="h-3 w-3"/>
                                </Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        min="1"
                                        max={item.stock}
                                        value={item.quantity} 
                                        onChange={(e) => handleUpdateCart(index, parseInt(e.target.value))} 
                                        className="w-16 h-7 text-center px-1 text-xs"
                                    />
                                    <span className="text-xs text-muted-foreground">x ৳{item.unit_price}</span>
                                </div>
                                <span className="font-mono font-medium text-sm">৳{item.total_amount.toLocaleString()}</span>
                            </div>
                        </li>
                    ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                    <ShoppingCart className="h-12 w-12 mb-2"/>
                    <p>Cart is empty</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-card space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Items</span><span className="font-mono">{cartSummary.totalItems}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">৳{cartSummary.totalAmount.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2"><span>Total</span><span className="font-mono text-primary">৳{cartSummary.totalAmount.toLocaleString()}</span></div>
            </div>
          </div>
        </form>
        
        <DialogFooter className="px-6 py-4 border-t bg-secondary/10">
            <div className="flex w-full justify-between items-center">
                <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1}>Previous</Button>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    {step < 3 ? (
                        <Button type="button" onClick={nextStep}>Next Step</Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Complete Sale"}
                        </Button>
                    )}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepSalesDialog;