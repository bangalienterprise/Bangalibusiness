import React, { useState, useMemo, useEffect } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Check, Package, AlertCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import * as db from '@/lib/database';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import SellerSelector from '@/components/customers/SellerSelector';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const MarketplaceView = () => {
    const { products, customers, activeBusiness, refreshData } = useBusiness();
    const { user: profile, hasPermission } = useAuth();
    const { 
        cart, 
        customerId, 
        sellerId, 
        paymentMethod, 
        amountPaid,
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        setCustomer, 
        setSeller, 
        setPaymentMethod, 
        setAmountPaid, 
        clearCart 
    } = useCart();
    const { toast } = useToast();

    // Local UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // Initialize seller ID from profile if not already set in persisted cart
    useEffect(() => {
        if (!sellerId && profile?.id) {
            setSeller(profile.id);
        }
    }, [profile, sellerId, setSeller]);

    // Derived State
    const selectedCustomer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

    // Permissions
    const canSelectSeller = hasPermission('manage_sales') || profile?.role === 'owner' || profile?.role === 'admin';

    // Filter Products
    const filteredProducts = useMemo(() => {
        return (products || [])
            .filter(p => p.stock > 0)
            .filter(p => {
                const termMatch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase());
                const categoryMatch = categoryFilter === 'all' || p.category === categoryFilter;
                return termMatch && categoryMatch;
            });
    }, [products, searchTerm, categoryFilter]);

    const categories = useMemo(() => {
        if (!products) return [];
        const cats = products.reduce((acc, p) => {
            if (p.category) acc.add(p.category);
            return acc;
        }, new Set());
        return ['all', ...Array.from(cats)];
    }, [products]);

    // Cart Calculations
    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, totalItems };
    }, [cart]);

    const dueAmount = Math.max(0, cartTotals.subtotal - (parseFloat(amountPaid) || 0));

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            toast({ title: "Customer Required", description: "Please select a customer to proceed.", variant: "destructive" });
            return;
        }
        if (cart.length === 0) {
            toast({ title: "Cart Empty", description: "Add products to cart first.", variant: "destructive" });
            return;
        }
        if (!sellerId) {
             toast({ title: "Seller Required", description: "Please assign a seller.", variant: "destructive" });
             return;
        }

        setIsSubmitting(true);
        try {
            const saleData = {
                p_business_id: activeBusiness.id,
                p_customer_id: selectedCustomer.id,
                p_seller_id: sellerId,
                p_sale_date: format(new Date(), 'yyyy-MM-dd'),
                p_amount_paid: parseFloat(amountPaid) || 0,
                p_payment_method: paymentMethod,
                p_notes: '',
                p_sale_items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.selling_price
                }))
            };

            // Using custom endpoint for sales recording
            await db.database.create('/sales/record-transaction', saleData);

            toast({ title: "Sale Successful", description: "Transaction recorded and stock updated." });
            clearCart(); // Clear global cart state
            setIsMobileCartOpen(false);
            refreshData(); // Refresh business data
        } catch (error) {
            console.error(error);
            toast({ title: "Transaction Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const CartSummary = () => (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b space-y-4 bg-muted/10">
                 <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Customer</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between h-10">
                                {selectedCustomer ? (
                                    <div className="flex items-center gap-2 truncate">
                                         <Avatar className="h-5 w-5"><AvatarFallback>{selectedCustomer.name[0]}</AvatarFallback></Avatar>
                                        <span className="truncate font-medium">{selectedCustomer.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4"/> Select Customer</span>
                                )}
                                <Search className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search customer..." />
                                <CommandList>
                                    <CommandEmpty>No customer found.</CommandEmpty>
                                    <CommandGroup>
                                        {customers.map(c => (
                                            <CommandItem key={c.id} onSelect={() => setCustomer(c.id)} className="flex items-center gap-2 cursor-pointer">
                                                <Avatar className="h-6 w-6"><AvatarFallback>{c.name[0]}</AvatarFallback></Avatar>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="truncate font-medium">{c.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
                                                </div>
                                                {customerId === c.id && <Check className="h-4 w-4" />}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {canSelectSeller && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Assigned Seller</label>
                        <SellerSelector value={sellerId} onChange={setSeller} />
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1">
                {cart.length > 0 ? (
                    <div className="divide-y">
                        {cart.map(item => (
                            <div key={item.id} className="p-3 flex gap-3 items-center hover:bg-muted/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">৳{item.selling_price} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="text-right min-w-[60px]">
                                    <p className="text-sm font-bold font-mono">৳{item.selling_price * item.quantity}</p>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive ml-auto mt-1" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm">Cart is empty</p>
                        <p className="text-xs opacity-70">Select products to start sale</p>
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 bg-muted/20 border-t space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-mono">৳{cartTotals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="font-mono text-primary">৳{cartTotals.subtotal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Paid Amount</label>
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">৳</span>
                            <Input 
                                type="number" 
                                className="h-9 pl-5 text-right font-mono" 
                                placeholder="0"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Method</label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="bank_transfer">Bank</SelectItem>
                                <SelectItem value="mobile_banking">Mobile</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {dueAmount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                        <AlertCircle className="h-3 w-3" />
                        <span className="font-medium">Due Amount: ৳{dueAmount.toLocaleString()}</span>
                    </div>
                )}

                <Button className="w-full h-11 text-base font-semibold" onClick={handleCheckout} disabled={isSubmitting || cart.length === 0}>
                    {isSubmitting ? "Processing..." : "Complete Sale"}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] gap-6 relative">
            {/* Left Side: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 min-h-0 pb-20 lg:pb-0">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11" // Taller input for mobile
                        />
                    </div>
                    <ScrollArea className="w-full sm:w-auto whitespace-nowrap pb-2 sm:pb-0">
                        <div className="flex gap-2 px-0.5">
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    variant={categoryFilter === cat ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCategoryFilter(cat)}
                                    className="capitalize rounded-full px-4 h-9"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <ScrollArea className="flex-1 pr-0 md:pr-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="flex flex-col justify-between hover:border-primary/50 transition-all active:scale-[0.98] cursor-pointer group" onClick={() => addToCart(product)}>
                                <CardHeader className="p-3">
                                    <div className="flex justify-between items-start gap-1">
                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 truncate max-w-[80px]">{product.category}</Badge>
                                        <span className={cn("text-[10px] font-medium shrink-0", product.stock < 5 ? "text-destructive" : "text-muted-foreground")}>
                                            {product.stock} left
                                        </span>
                                    </div>
                                    <CardTitle className="text-sm font-medium line-clamp-2 mt-2 leading-tight h-10">{product.name}</CardTitle>
                                </CardHeader>
                                <CardFooter className="p-3 pt-0 flex justify-between items-center">
                                    <span className="font-bold font-mono text-sm">৳{product.selling_price}</span>
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Package className="h-12 w-12 mb-2 opacity-20" />
                                <p>No products found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Mobile Cart Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">{cartTotals.totalItems} items</span>
                        <span className="font-bold font-mono text-lg">৳{cartTotals.subtotal.toLocaleString()}</span>
                    </div>
                    <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
                        <SheetTrigger asChild>
                            <Button className="flex-1 h-12 gap-2 rounded-full shadow-lg text-base">
                                <ShoppingCart className="h-5 w-5" />
                                View Cart
                                <ChevronUp className="h-4 w-4 ml-auto opacity-70" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" /> Current Sale
                                </SheetTitle>
                            </SheetHeader>
                            <div className="h-[calc(90vh-65px)]">
                                <CartSummary />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Desktop Cart Sidebar */}
            <Card className="hidden lg:flex w-[400px] flex-col h-full border-l shadow-xl bg-card z-10">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Current Sale
                        <Badge variant="secondary" className="ml-auto">{cartTotals.totalItems} Items</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                    <CartSummary />
                </CardContent>
            </Card>
        </div>
    );
};

export default MarketplaceView;