import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ShoppingCart, Search, UserPlus, CreditCard, Banknote, Landmark, Globe, Trash2, Plus, Minus, Receipt, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import SalesRepSelector from '@/components/sales/SalesRepSelector';
import CartItem from '@/components/sales/CartItem';

const SalesPage = () => {
    const { user, role } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Customer');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedRep, setSelectedRep] = useState(user?.id);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Payment State
    const [discount, setDiscount] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    
    // Modals
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        if (user?.business_id) {
            const prods = await mockDatabase.getAll('products', user.business_id);
            setProducts(prods);
            const team = await mockDatabase.getActiveSellers(user.business_id);
            setSellers(team);
            const custs = await mockDatabase.getAll('customers', user.business_id);
            setCustomers(custs);
            setSelectedRep(user.id);
        }
        setLoading(false);
    };

    const addToCart = (product) => {
        if (product.stock <= 0) {
            toast({ variant: "destructive", title: "Out of Stock", description: "This product is currently unavailable." });
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                     toast({ variant: "destructive", title: "Stock Limit Reached", description: `Only ${product.stock} items available.` });
                     return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, newQty) => {
        const product = products.find(p => p.id === id);
        if (newQty > product.stock) {
             toast({ variant: "destructive", title: "Stock Limit Reached", description: `Only ${product.stock} items available.` });
             return;
        }
        if (newQty < 1) return;
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;
    const paidVal = parseFloat(amountPaid) || 0;
    const due = Math.max(0, total - paidVal);
    const change = Math.max(0, paidVal - total);

    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
             toast({ variant: "destructive", title: "Missing Fields", description: "Name and Phone are required." });
             return;
        }
        try {
            const created = await mockDatabase.create('customers', {
                ...newCustomer, 
                business_id: user.business_id,
                total_purchases: 0, 
                total_due: 0
            });
            setCustomers([...customers, created]);
            setSelectedCustomer(created.name);
            setSelectedCustomerId(created.id);
            setCustomerModalOpen(false);
            setNewCustomer({ name: '', phone: '', address: '' });
            toast({ title: "Success", description: "Customer added successfully." });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: e.message });
        }
    };

    const handleCustomerSelect = (val) => {
        setSelectedCustomer(val);
        const cust = customers.find(c => c.name === val);
        setSelectedCustomerId(cust ? cust.id : null);
    };

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            toast({ variant: "destructive", title: "Cart Empty", description: "Add products to cart first." });
            return;
        }
        if (total < 0) {
            toast({ variant: "destructive", title: "Invalid Total", description: "Total cannot be negative." });
            return;
        }

        const saleData = {
            business_id: user.business_id,
            items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.selling_price,
                subtotal: item.selling_price * item.quantity
            })),
            subtotal,
            tax: taxAmount,
            discount,
            total,
            amount_paid: paidVal,
            due_amount: due,
            payment_method: paymentMethod,
            status: due > 0 ? 'Due' : 'Paid',
            customer_name: selectedCustomer,
            customer_id: selectedCustomerId,
            sold_by: selectedRep,
            processed_by: user.id,
            date: new Date().toISOString()
        };

        try {
            const sale = await mockDatabase.create('sales', saleData);
            
            // Deduct Stock
            for (const item of cart) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    await mockDatabase.update('products', product.id, { 
                        stock: product.stock - item.quantity 
                    });
                }
            }

            // Update Customer Dues
            if (selectedCustomerId && due > 0) {
                const cust = customers.find(c => c.id === selectedCustomerId);
                if (cust) {
                    await mockDatabase.update('customers', cust.id, {
                        total_due: (cust.total_due || 0) + due,
                        last_purchase_date: new Date().toISOString()
                    });
                }
            }

            setLastSale(sale);
            setReceiptOpen(true);
            toast({ title: "Sale Completed", description: `Total: ৳${total}` });
            
            // Reset
            setCart([]);
            setAmountPaid('');
            setDiscount(0);
            loadData(); // Reload stock
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[#0f172a] text-white overflow-hidden">
            <Helmet><title>POS - New Sale</title></Helmet>

            {/* Left Panel: Products */}
            <div className="w-full md:w-[45%] flex flex-col border-r border-slate-800 bg-slate-900/50">
                <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg text-white">Products</h2>
                         <SalesRepSelector 
                            sellers={sellers} 
                            selectedSellerId={selectedRep} 
                            onChange={setSelectedRep}
                            canChange={role === 'owner' || role === 'manager'}
                            className="w-auto"
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input 
                            placeholder="Search products (Name, SKU)..." 
                            className="pl-10 bg-slate-950 border-slate-700 h-10 focus-visible:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 content-start">
                    {filteredProducts.map(product => (
                        <Card 
                            key={product.id} 
                            className="group bg-slate-800 border-slate-700 hover:border-blue-500 hover:bg-slate-800/80 cursor-pointer transition-all p-3 flex flex-col justify-between h-32 relative overflow-hidden"
                            onClick={() => addToCart(product)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-slate-200 group-hover:text-white">{product.name}</h3>
                                <p className="text-[10px] text-slate-500 font-mono">{product.sku}</p>
                            </div>
                            <div className="flex justify-between items-end mt-2 relative z-10">
                                <span className="font-bold text-blue-400">৳{product.selling_price}</span>
                                <Badge variant={product.stock > 0 ? "outline" : "destructive"} className={cn("text-[10px] px-1 h-5", product.stock > 0 ? "border-slate-600 text-slate-400" : "")}>
                                    {product.stock > 0 ? `${product.stock} Left` : 'Out'}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center h-40 text-slate-500">
                             <Search className="h-8 w-8 mb-2 opacity-50" />
                             <p>No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Cart & Payment */}
            <div className="w-full md:w-[55%] flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl z-10">
                {/* Header Info */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Receipt className="h-5 w-5" />
                        <span className="font-medium">New Sale</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
                            <SelectTrigger className="w-[200px] h-9 bg-slate-800 border-slate-700 text-sm">
                                <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="Walk-in Customer">Walk-in Customer</SelectItem>
                                {customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button size="icon" variant="outline" className="h-9 w-9 border-slate-700 hover:bg-slate-800" onClick={() => setCustomerModalOpen(true)}>
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-950/50">
                   {cart.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-slate-600">
                           <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
                           <p className="text-lg font-medium">Cart is empty</p>
                           <p className="text-sm">Select products to add to cart</p>
                       </div>
                   ) : (
                       cart.map(item => (
                           <CartItem 
                               key={item.id} 
                               item={item} 
                               onUpdateQuantity={updateQuantity}
                               onRemove={removeFromCart}
                           />
                       ))
                   )}
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-900 border-t border-slate-800 p-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                         <div className="flex justify-between text-slate-400">
                             <span>Subtotal</span>
                             <span className="text-white font-medium">৳{subtotal}</span>
                         </div>
                         <div className="flex justify-between items-center text-slate-400">
                             <span>Discount</span>
                             <div className="flex items-center gap-2">
                                <span className="text-xs">-</span>
                                <Input 
                                    type="number" 
                                    className="w-20 h-7 text-right bg-slate-950 border-slate-700 text-xs" 
                                    value={discount}
                                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                />
                             </div>
                         </div>
                         <div className="flex justify-between items-center text-slate-400">
                             <span>Tax (%)</span>
                             <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    className="w-20 h-7 text-right bg-slate-950 border-slate-700 text-xs" 
                                    value={taxRate}
                                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                />
                             </div>
                         </div>
                         <div className="flex justify-between text-xl font-bold text-white border-t border-slate-800 pt-3 mt-1">
                             <span>Total Payable</span>
                             <span className="text-blue-400">৳{total.toFixed(2)}</span>
                         </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-5 space-y-1">
                            <label className="text-xs text-slate-500 ml-1">Payment Method</label>
                            <div className="grid grid-cols-4 gap-1">
                                {['Cash', 'Card', 'Check', 'Online'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-md border text-[10px] transition-all",
                                            paymentMethod === method 
                                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        {method === 'Cash' && <Banknote className="h-4 w-4 mb-1" />}
                                        {method === 'Card' && <CreditCard className="h-4 w-4 mb-1" />}
                                        {method === 'Check' && <Landmark className="h-4 w-4 mb-1" />}
                                        {method === 'Online' && <Globe className="h-4 w-4 mb-1" />}
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-7 space-y-3">
                             <div className="flex gap-4 items-end">
                                 <div className="flex-1 space-y-1">
                                    <label className="text-xs text-slate-500 ml-1">Amount Paid</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                                        <Input 
                                            type="number" 
                                            className="bg-slate-950 border-slate-700 h-10 pl-8 font-bold text-lg text-white"
                                            value={amountPaid}
                                            onChange={e => setAmountPaid(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                 </div>
                                 <div className="flex-1 space-y-1">
                                     <div className="flex justify-between text-xs px-1">
                                         <span className="text-slate-500">Change</span>
                                         <span className="text-green-400 font-mono font-bold">৳{change.toFixed(0)}</span>
                                     </div>
                                     <div className="flex justify-between text-xs px-1 pt-2 border-t border-slate-800">
                                         <span className="text-slate-500">Due</span>
                                         <span className={cn("font-mono font-bold", due > 0 ? "text-red-400" : "text-slate-400")}>৳{due.toFixed(0)}</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setCart([])}>
                            Clear Cart
                        </Button>
                        <Button 
                            className="flex-[3] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/20" 
                            onClick={handleCompleteSale}
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" /> Complete Sale
                        </Button>
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
                <DialogContent className="bg-white text-slate-900 max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center border-b pb-4">Receipt</DialogTitle>
                    </DialogHeader>
                    {lastSale && (
                        <div className="text-sm space-y-4 py-4 font-mono">
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Bangali Enterprise</h3>
                                <p>Date: {format(new Date(lastSale.date), 'PP p')}</p>
                                <p>Order #{lastSale.id.slice(0, 8)}</p>
                            </div>
                            <div className="border-t border-b py-2 space-y-1">
                                {lastSale.items.map((item, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span>{item.product_name} x{item.quantity}</span>
                                        <span>{item.subtotal}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Subtotal:</span><span>{lastSale.subtotal}</span></div>
                                <div className="flex justify-between"><span>Discount:</span><span>-{lastSale.discount}</span></div>
                                <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{lastSale.total}</span></div>
                            </div>
                            <div className="text-center pt-4 text-xs text-slate-500">
                                Thank you for your business!
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-center">
                        <Button onClick={() => window.print()} className="w-full">Print Receipt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Customer Modal */}
            <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>Enter customer details for quick add.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input 
                                value={newCustomer.name} 
                                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                                className="bg-slate-950 border-slate-700" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input 
                                value={newCustomer.phone} 
                                onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                                className="bg-slate-950 border-slate-700" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address (Optional)</label>
                            <Input 
                                value={newCustomer.address} 
                                onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                                className="bg-slate-950 border-slate-700" 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCustomerModalOpen(false)} className="border-slate-700 text-white">Cancel</Button>
                        <Button onClick={handleCreateCustomer} className="bg-blue-600">Save Customer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesPage;