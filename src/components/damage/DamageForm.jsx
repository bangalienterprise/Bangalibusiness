import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/services/supabaseClient'; // Use real client
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronsUpDown, PlusCircle, Trash2, Loader2 } from 'lucide-react';

const damageReasons = ["Expired", "Broken", "Damaged", "Spoiled", "Contaminated", "Mishandled", "Other"];

const damageSchema = z.object({
    product: z.object({
        id: z.string().uuid(),
        name: z.string(),
        cost_price: z.number(),
        stock: z.number(),
    }).refine(p => p.id, { message: "Product is required." }),
    quantity: z.number().int().positive("Quantity must be a positive number."),
    reason: z.string().min(1, "Reason is required."),
    damage_date: z.date({ required_error: "A date is required." }),
});

const DamageForm = ({ onDamageConfirmed }) => {
    const { activeBusiness } = useBusiness();
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [openProduct, setOpenProduct] = useState(false);
    const [openReason, setOpenReason] = useState(false);
    const [damageList, setDamageList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(damageSchema),
        defaultValues: {
            quantity: 1,
            damage_date: new Date(),
        }
    });

    const selectedProduct = watch('product');

    useEffect(() => {
        const fetchProducts = async () => {
            if (!activeBusiness?.id) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('business_id', activeBusiness.id);

                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                toast({ title: "Error fetching products", description: error.message, variant: "destructive" });
            }
        };
        fetchProducts();
    }, [activeBusiness, toast]);

    useEffect(() => {
        let tempProducts = products;
        if (category !== 'All') {
            tempProducts = tempProducts.filter(p => p.category === category);
        }
        if (searchTerm) {
            tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredProducts(tempProducts);
    }, [products, category, searchTerm]);

    const handleAddToList = (data) => {
        if (data.quantity > data.product.stock) {
            toast({ title: "Invalid Quantity", description: `Cannot add more than available stock (${data.product.stock}).`, variant: "destructive" });
            return;
        }
        const newItem = {
            ...data,
            total_loss: data.quantity * (data.product.cost_price || 0),
            id: `${data.product.id}-${Date.now()}` // unique id for list item
        };
        setDamageList(prev => [...prev, newItem]);
        reset({ quantity: 1, damage_date: new Date() });
    };

    const removeFromList = (id) => {
        setDamageList(prev => prev.filter(item => item.id !== id));
    };

    const totalLoss = useMemo(() => {
        return damageList.reduce((acc, item) => acc + item.total_loss, 0);
    }, [damageList]);

    const handleConfirmDamage = async () => {
        if (damageList.length === 0) {
            toast({ title: "Empty List", description: "Please add items to the damage list first.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Create Main Damage Record
            const { data: damageRecord, error: damageError } = await supabase
                .from('damages')
                .insert({
                    business_id: activeBusiness.id,
                    user_id: user.id,
                    total_loss: totalLoss,
                    note: `Damage reported on ${format(new Date(), 'MMM d, yyyy')}`
                })
                .select()
                .single();

            if (damageError) throw damageError;

            // 2. Create Damage Items
            const damageItems = damageList.map(item => ({
                damage_id: damageRecord.id,
                product_id: item.product.id,
                product_name: item.product.name,
                quantity: item.quantity,
                reason: item.reason,
                loss_amount: item.total_loss,
                created_at: format(item.damage_date, 'toISOString') // fix format usage
            }));

            const { error: itemsError } = await supabase
                .from('damage_items')
                .insert(damageItems);

            if (itemsError) throw itemsError;

            // 3. Update Stock (Decrement)
            for (const item of damageList) {
                // Optimistic stock update - in production use RPC
                const { error: updateError } = await supabase.rpc('decrement_stock', {
                    p_id: item.product.id,
                    p_qty: item.quantity
                }).catch(async () => {
                    // Fallback if RPC doesn't exist
                    const currentStock = item.product.stock;
                    return await supabase
                        .from('products')
                        .update({ stock_qty: currentStock - item.quantity }) // assuming stock_qty is the column
                        .eq('id', item.product.id);
                });

                // Fallback: simple numeric update if RPC failed or not used above
                if (updateError) console.error("Stock update failed", updateError);
            }

            toast({ title: "Success", description: "Damage records confirmed and stock updated." });
            setDamageList([]);
            if (onDamageConfirmed) onDamageConfirmed();

        } catch (error) {
            console.error(error);
            toast({ title: "Failed to confirm damage", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <h2 className="text-2xl font-bold text-white">Add Damaged Product</h2>
                <form onSubmit={handleSubmit(handleAddToList)} className="space-y-4">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Product</Label>
                        <Popover open={openProduct} onOpenChange={setOpenProduct}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={openProduct} className="w-full justify-between bg-slate-900 border-slate-700 text-slate-200">
                                    {selectedProduct?.name ? selectedProduct.name : "Select product..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0 bg-slate-800 border-slate-700">
                                <Command className="bg-slate-800 text-slate-200">
                                    <div className="p-2 border-b border-slate-700">
                                        <Input
                                            placeholder="Search product..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-9 bg-slate-900 border-slate-700 focus:ring-0"
                                        />
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="mt-2 h-8 bg-slate-900 border-slate-700 text-xs">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                                                <SelectItem value="All">All Categories</SelectItem>
                                                {/* Start: Dynamic categories would be better, but keeping static for now */}
                                                <SelectItem value="Beverage">Beverage</SelectItem>
                                                <SelectItem value="Snacks">Snacks</SelectItem>
                                                <SelectItem value="Candy">Candy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <CommandEmpty>No product found.</CommandEmpty>
                                    <CommandGroup className="max-h-60 overflow-y-auto">
                                        {filteredProducts.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                onSelect={() => {
                                                    setValue('product', {
                                                        id: product.id,
                                                        name: product.name,
                                                        cost_price: product.cost_price || 0,
                                                        stock: product.stock_qty || 0
                                                    });
                                                    setOpenProduct(false);
                                                }}
                                                className="hover:bg-slate-700 cursor-pointer"
                                            >
                                                <div className="flex justify-between w-full items-center">
                                                    <span>{product.name}</span>
                                                    <span className="text-xs text-slate-400">({product.stock_qty} left)</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.product && <p className="text-sm text-red-400">{errors.product.message}</p>}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-slate-300">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            {...register('quantity', { valueAsNumber: true })}
                            min="1"
                            className="bg-slate-900 border-slate-700 text-white"
                        />
                        {errors.quantity && <p className="text-sm text-red-400">{errors.quantity.message}</p>}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Reason</Label>
                        <Popover open={openReason} onOpenChange={setOpenReason}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={openReason} className="w-full justify-between bg-slate-900 border-slate-700 text-slate-200">
                                    {watch('reason') || "Select reason..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0 bg-slate-800 border-slate-700">
                                <Command className="bg-slate-800 text-slate-200">
                                    <CommandInput placeholder="Search reason..." className="bg-slate-900 text-white" />
                                    <CommandEmpty>No reason found.</CommandEmpty>
                                    <CommandGroup>
                                        {damageReasons.map((reason) => (
                                            <CommandItem
                                                key={reason}
                                                onSelect={() => {
                                                    setValue('reason', reason);
                                                    setOpenReason(false);
                                                }}
                                                className="hover:bg-slate-700 cursor-pointer"
                                            >
                                                {reason}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.reason && <p className="text-sm text-red-400">{errors.reason.message}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Damage Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-200", !watch('damage_date') && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {watch('damage_date') ? format(watch('damage_date'), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                                <Calendar
                                    mode="single"
                                    selected={watch('damage_date')}
                                    onSelect={(date) => setValue('damage_date', date)}
                                    className="text-slate-200"
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.damage_date && <p className="text-sm text-red-400">{errors.damage_date.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add to Damage List
                    </Button>
                </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-white">Damage List</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="p-4 border-b border-slate-800">
                        <div className="grid grid-cols-6 gap-4 font-semibold text-sm text-slate-400">
                            <div className="col-span-2">Product</div>
                            <div>Qty</div>
                            <div>Reason</div>
                            <div className="text-right">Total Loss</div>
                            <div></div>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                        {damageList.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No items added yet.</p>
                        ) : (
                            damageList.map(item => (
                                <div key={item.id} className="grid grid-cols-6 gap-4 items-center text-sm p-2 rounded-md hover:bg-slate-800 text-slate-200">
                                    <div className="col-span-2 font-medium">{item.product.name}</div>
                                    <div>{item.quantity}</div>
                                    <div>{item.reason}</div>
                                    <div className="text-right font-mono text-xs">৳{item.total_loss.toFixed(2)}</div>
                                    <div className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700" onClick={() => removeFromList(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/30">
                        <div className="text-lg font-bold text-white">Total Loss: <span className="font-mono text-red-400">৳{totalLoss.toFixed(2)}</span></div>
                        <Button onClick={handleConfirmDamage} disabled={damageList.length === 0 || isSubmitting} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Confirm Damage'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DamageForm;