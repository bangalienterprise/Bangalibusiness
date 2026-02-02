import React, { useState, useMemo } from 'react';
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
import { createCollection } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CreateCollectionDialog = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const { user: profile } = useAuth();
    const { customers, sales, refreshData } = useBusiness();
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedSale, setSelectedSale] = useState(null);
    const [openCustomerCombo, setOpenCustomerCombo] = useState(false);

    // Filter sales for selected customer that have due amount
    const dueSales = useMemo(() => {
        if (!selectedCustomer) return [];
        return sales.filter(s => 
            s.customer_id === selectedCustomer.id && 
            (s.final_amount - s.amount_paid) > 0.1 // Use epsilon for float
        );
    }, [selectedCustomer, sales]);

    const schema = z.object({
        amount_collected: z.number().min(0.01, "Amount must be positive."),
        payment_method: z.string().min(1, "Payment method is required."),
        collection_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date",
        }),
        notes: z.string().optional(),
    });

    const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            amount_collected: 0,
            payment_method: 'cash',
            collection_date: format(new Date(), 'yyyy-MM-dd'),
            notes: ''
        }
    });

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setSelectedSale(null);
        setValue('amount_collected', 0);
        setOpenCustomerCombo(false);
    };

    const handleSaleSelect = (saleId) => {
        const sale = dueSales.find(s => s.id === saleId);
        setSelectedSale(sale);
        if (sale) {
            const due = sale.final_amount - sale.amount_paid;
            setValue('amount_collected', due);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedSale) {
            toast({ title: "Select a sale", description: "Please select a sale to collect payment for.", variant: "destructive" });
            return;
        }

        const dueAmount = selectedSale.final_amount - selectedSale.amount_paid;
        if (data.amount_collected > dueAmount + 1) { // Allow small buffer for rounding
             toast({ title: "Invalid Amount", description: `Amount cannot exceed the due amount of ৳${dueAmount.toLocaleString()}.`, variant: "destructive" });
             return;
        }

        setLoading(true);
        try {
            await createCollection({
                sale_id: selectedSale.id,
                business_id: profile.business_id,
                collected_by: profile.id,
                amount_collected: data.amount_collected,
                collection_date: data.collection_date,
                payment_method: data.payment_method,
                notes: data.notes
            });

            toast({ title: 'Payment Collected!', description: `৳${data.amount_collected.toLocaleString()} has been successfully recorded.` });
            refreshData();
            onClose();
            reset();
            setSelectedCustomer(null);
            setSelectedSale(null);
        } catch (error) {
            toast({ title: 'Error collecting payment', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Collection</DialogTitle>
                    <DialogDescription>Record a payment received from a customer.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Customer Selection */}
                    <div className="flex flex-col space-y-2">
                        <Label>Customer</Label>
                        <Popover open={openCustomerCombo} onOpenChange={setOpenCustomerCombo}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={openCustomerCombo} className="w-full justify-between">
                                    {selectedCustomer ? selectedCustomer.name : "Select customer..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search customer..." />
                                    <CommandEmpty>No customer found.</CommandEmpty>
                                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                                        {customers.map((customer) => (
                                            <CommandItem key={customer.id} onSelect={() => handleCustomerSelect(customer)}>
                                                <Check className={cn("mr-2 h-4 w-4", selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0")} />
                                                {customer.name} ({customer.phone})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Sale Selection */}
                    {selectedCustomer && (
                        <div className="flex flex-col space-y-2">
                            <Label>Select Due Sale</Label>
                            <Select onValueChange={handleSaleSelect} value={selectedSale?.id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sale to pay..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {dueSales.length > 0 ? (
                                        dueSales.map(sale => (
                                            <SelectItem key={sale.id} value={sale.id}>
                                                {format(new Date(sale.sale_date), 'MMM dd')} - Due: ৳{(sale.final_amount - sale.amount_paid).toLocaleString()} (Total: ৳{sale.final_amount.toLocaleString()})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">No due sales found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Payment Details Form */}
                    {selectedSale && (
                        <form id="collection-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
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
                                {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" {...register('notes')} placeholder="Optional notes..." />
                            </div>
                        </form>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="collection-form" disabled={loading || !selectedSale}>
                        {loading ? 'Processing...' : 'Save Collection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCollectionDialog;