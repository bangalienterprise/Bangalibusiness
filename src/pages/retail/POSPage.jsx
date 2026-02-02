import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Trash2, ShoppingCart, CreditCard, User, Minus, RefreshCcw, Save, Users } from 'lucide-react';

const POSPage = () => {
    const { user, business, profile } = useAuth();
    const { toast } = useToast();
    
    // Data States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Cart State
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Transaction State
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState('');
    
    // New Customer Dialog State
    const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    useEffect(() => {
        if (user?.id) {
            setSelectedSellerId(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (business?.id) {
            fetchData();
        }
    }, [business]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [productsRes, categoriesRes, customersRes, staffRes] = await Promise.all([
                supabase.from('products').select('*').eq('business_id', business.id).gt('stock_quantity', 0),
                supabase.from('categories').select('*').eq('business_id', business.id),
                supabase.from('customers').select('*').eq('business_id', business.id),
                supabase.from('business_users').select('user_id, role, profiles(id, full_name, email)').eq('business_id', business.id)
            ]);

            if (productsRes.error) throw productsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;
            if (customersRes.error) throw customersRes.error;
            // staffRes might fail if RLS is strict, so we handle it gracefully or it might be empty
            
            setProducts(productsRes.data || []);
            setCategories(categoriesRes.data || []);
            setCustomers(customersRes.data || []);
            
            if (staffRes.data) {
                const formattedStaff = staffRes.data.map(s => ({
                    id: s.user_id,
                    name: s.profiles?.full_name || s.profiles?.email || 'Unknown',
                    role: s.role
                }));
                setStaff(formattedStaff);
            }

        } catch (error) {
            console.error('Error fetching POS data:', error);
            toast({ variant: "destructive", title: "Failed to load POS data" });
        } finally {
            setLoadingData(false);
        }
    };

    // Filter Products
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    // Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock_quantity) {
                    toast({ variant: "destructive", title: "Stock limit reached" });
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === productId) {
                    const newQty = Math.max(1, item.qty + delta);
                    if (delta > 0 && newQty > item.stock_quantity) {
                         toast({ variant: "destructive", title: "Stock limit reached" });
                         return item;
                    }
                    return { ...item, qty: newQty };
                }
                return item;
            });
        });
    };

    // Calculations
    const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price * item.qty), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const changeAmount = (Number(paidAmount) || 0) - totalAmount;

    // Handle Sale
    const handleCompleteSale = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            const totalCost = cart.reduce((sum, item) => sum + (item.buying_price * item.qty), 0);
            const profit = totalAmount - totalCost;
            
            const transactionData = {
                business_id: business.id,
                sold_by: selectedSellerId || profile.id, // Use selected seller
                customer_id: selectedCustomer?.id || null, // Allow null for walk-in
                total_amount: totalAmount,
                paid_amount: Number(paidAmount) || totalAmount, // Default to full payment if not specified
                due_amount: Math.max(0, totalAmount - (Number(paidAmount) || totalAmount)),
                profit: profit,
                created_at: new Date().toISOString()
            };

            // 1. Create Transaction
            const { data: sale, error: saleError } = await supabase
                .from('sales_transactions')
                .insert(transactionData)
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Create Sale Items
            const saleItems = cart.map(item => ({
                sale_id: sale.id,
                product_id: item.id,
                qty: item.qty,
                price: item.selling_price
            }));

            const { error: itemsError } = await supabase
                .from('sales_items')
                .insert(saleItems);

            if (itemsError) throw itemsError;

            // 3. Update Product Stock
            // Note: In a real app, use an RPC function for atomic updates.
            for (const item of cart) {
                await supabase.rpc('decrement_stock', { 
                    p_id: item.id, 
                    p_qty: item.qty 
                }).catch(async () => {
                    // Fallback manual update
                     await supabase
                    .from('products')
                    .update({ stock_quantity: item.stock_quantity - item.qty })
                    .eq('id', item.id);
                });
            }

            // 4. Update Customer Due if needed
            if (selectedCustomer && transactionData.due_amount > 0) {
                 await supabase.rpc('increment_customer_due', { 
                     row_id: selectedCustomer.id, 
                     amount: transactionData.due_amount 
                 }).catch(async () => {
                     // Fallback manual update if RPC missing
                     const { data: currentCust } = await supabase.from('customers').select('current_due').eq('id', selectedCustomer.id).single();
                     await supabase.from('customers')
                        .update({ current_due: (currentCust?.current_due || 0) + transactionData.due_amount })
                        .eq('id', selectedCustomer.id);
                 });
            }

            toast({ title: "Sale Completed!", description: `Invoice #${sale.id.slice(0, 8)}` });
            
            // Reset
            setCart([]);
            setSelectedCustomer(null);
            setPaidAmount('');
            setPaymentMethod('Cash');
            fetchData(); // Refresh stock

        } catch (error) {
            console.error('Sale failed:', error);
            toast({ variant: "destructive", title: "Transaction failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCreateCustomer = async () => {
        if(!newCustomerName) return;
        try {
            const { data, error } = await supabase
                .from('customers')
                .insert({
                    business_id: business.id,
                    name: newCustomerName,
                    phone: newCustomerPhone,
                    current_due: 0
                })
                .select()
                .single();
            
            if(error) throw error;
            
            setCustomers([...customers, data]);
            setSelectedCustomer(data);
            setIsNewCustomerOpen(false);
            setNewCustomerName('');
            setNewCustomerPhone('');
            toast({ title: "Customer Created" });
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to create customer" });
        }
    };

    const canSelectSeller = profile?.role === 'owner' || profile?.role === 'manager' || profile?.role === 'global_admin';

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4 animate-in fade-in">
            <Helmet><title>POS - Bangali Enterprise</title></Helmet>
            
            {/* Left Side - Products */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search products by name or SKU..." 
                            className="pl-9 bg-slate-800 border-slate-700 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <ScrollArea className="flex-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loadingData ? (
                            <div className="col-span-full text-center text-slate-500 py-10">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center text-slate-500 py-10">No products found</div>
                        ) : (
                            filteredProducts.map(product => (
                                <Card 
                                    key={product.id} 
                                    className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500 transition-all group overflow-hidden"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="aspect-video w-full bg-slate-900 flex items-center justify-center text-slate-600">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingCart className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-white truncate text-sm" title={product.name}>{product.name}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-blue-400 font-bold">৳{product.selling_price}</span>
                                            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full">
                                                Stk: {product.stock_quantity}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Side - Cart */}
            <div className="w-[400px] flex flex-col bg-slate-900 border-l border-slate-800 h-full">
                {/* Staff & Customer Section */}
                <div className="p-4 border-b border-slate-800 space-y-3">
                    
                    {/* Served By (Only for Owners/Managers) */}
                    {canSelectSeller && (
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500 uppercase">Served By</Label>
                            <Select 
                                value={selectedSellerId} 
                                onValueChange={setSelectedSellerId}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-full h-9">
                                    <SelectValue placeholder="Select Staff" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    {staff.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            <span className="flex items-center gap-2">
                                                <User className="h-3 w-3" /> {s.name} <span className="text-slate-500 text-xs">({s.role})</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Customer Selection */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                             <Label className="text-xs text-slate-500 uppercase">Customer</Label>
                             <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 text-blue-400 hover:text-blue-300 px-2 text-xs">
                                        <Plus className="h-3 w-3 mr-1" /> New
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Add New Customer</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input 
                                                value={newCustomerName} 
                                                onChange={e => setNewCustomerName(e.target.value)} 
                                                className="bg-slate-900 border-slate-700" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input 
                                                value={newCustomerPhone} 
                                                onChange={e => setNewCustomerPhone(e.target.value)} 
                                                className="bg-slate-900 border-slate-700" 
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateCustomer}>Create Customer</Button>
                                    </DialogFooter>
                                </DialogContent>
                             </Dialog>
                        </div>
                        <Select 
                            value={selectedCustomer?.id || "walk-in"} 
                            onValueChange={(val) => setSelectedCustomer(val === "walk-in" ? null : customers.find(c => c.id === val))}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-full h-9">
                                <SelectValue placeholder="Walk-in Customer" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Cart Items */}
                <ScrollArea className="flex-1 p-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                                        <div className="text-xs text-blue-400 mt-1">৳{item.selling_price} x {item.qty}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-white text-sm">৳{item.selling_price * item.qty}</span>
                                        <div className="flex items-center bg-slate-800 rounded-md border border-slate-700">
                                            <button 
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1 hover:text-blue-400 text-slate-400"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="px-2 text-xs font-medium text-white min-w-[20px] text-center">{item.qty}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1 hover:text-blue-400 text-slate-400"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-500 hover:text-red-400 self-center pl-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Totals & Actions */}
                <div className="p-4 bg-slate-800 border-t border-slate-700">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-slate-400 text-sm">
                            <span>Subtotal ({totalItems} items)</span>
                            <span>৳{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-slate-700">
                            <span>Total</span>
                            <span>৳{totalAmount}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-2">
                            <Input 
                                type="number" 
                                placeholder="Paid Amount" 
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                            <div className="flex items-center justify-end px-3 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-300">
                                Change: <span className="ml-2 font-bold text-white">৳{Math.max(0, changeAmount)}</span>
                            </div>
                         </div>
                         
                         <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold"
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCompleteSale}
                         >
                            {isProcessing ? <RefreshCcw className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                            {isProcessing ? 'Processing...' : `Charge ৳${totalAmount}`}
                         </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSPage;