import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Search, Edit, History, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StockDialog from '@/components/stock/StockDialog';
import ProductDialog from '@/components/products/ProductDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const StockHistoryDialog = ({ open, onOpenChange, product }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!product) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('stock_history_items')
                .select('quantity, cost_price, stock_history:stock_history_id(entry_date, type, description, user:added_by(full_name))')
                .eq('product_id', product.id)
                .order('entry_date', { referencedTable: 'stock_history', ascending: false });

            if (error) {
                console.error("Error fetching stock history:", error);
                setHistory([]);
            } else {
                setHistory(data || []);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [product]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Stock History: {product?.name}</DialogTitle>
                    <DialogDescription>Movement log for this product.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={5} className="text-center">Loading history...</TableCell></TableRow>}
                            {!loading && history.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No history found.</TableCell></TableRow>}
                            {!loading && history.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(item.stock_history.entry_date).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant={item.stock_history.type === 'purchase' ? 'secondary' : 'outline'}>{item.stock_history.type}</Badge></TableCell>
                                    <TableCell className={`font-semibold ${item.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                                    </TableCell>
                                    <TableCell>{item.stock_history.user?.full_name || 'System'}</TableCell>
                                    <TableCell>{item.stock_history.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};


const StockManagement = () => {
    const { toast } = useToast();
    const { activeBusiness } = useBusiness();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadProducts = useCallback(async () => {
        if (!activeBusiness) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', activeBusiness.id)
                .order('name', { ascending: true });
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            toast({ title: 'Error loading products', description: error.message, variant: 'destructive' });
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [activeBusiness, toast]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);
    
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    };

    const handleViewHistory = (product) => {
        setSelectedProduct(product);
        setIsHistoryDialogOpen(true);
    };

    // Defensive check: ensure products is an array
    const safeProducts = Array.isArray(products) ? products : [];

    const filteredProducts = useMemo(() =>
        safeProducts.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())),
        [safeProducts, searchTerm]
    );

    const { totalStockValue, lowStockCount } = useMemo(() => {
        let totalValue = 0;
        let lowCount = 0;
        safeProducts.forEach(p => {
            totalValue += (p.stock || 0) * (p.cost_price || 0);
            if ((p.stock || 0) <= 10) { // Assuming low stock threshold is 10
                lowCount++;
            }
        });
        return { totalStockValue: totalValue, lowStockCount: lowCount };
    }, [safeProducts]);


    return (
        <>
            <Helmet><title>Stock Management - Bangali Enterprise</title></Helmet>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Stock Management</h1>
                        <p className="text-muted-foreground">Manage your product inventory levels and history.</p>
                    </div>
                    <Button onClick={() => setIsStockDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Stock (Purchase)</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><p className="text-2xl font-bold">৳{totalStockValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Based on cost price</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Products</CardTitle><Package className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{safeProducts.length}</p><p className="text-xs text-muted-foreground">Unique product lines</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Low Stock Items</CardTitle><Package className="h-4 w-4 text-muted-foreground"/></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{lowStockCount}</p><p className="text-xs text-muted-foreground">Items with stock ≤ 10</p></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Current Inventory</CardTitle>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Current Stock</TableHead>
                                    <TableHead className="text-right">Cost Price</TableHead>
                                    <TableHead className="text-right">Selling Price</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Loading inventory...</TableCell></TableRow>
                                ) : filteredProducts.length > 0 ? filteredProducts.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>{product.stock}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">৳{(product.cost_price || 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono">৳{(product.selling_price || 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-center space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewHistory(product)}><History className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}><Edit className="h-4 w-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No products found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <StockDialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen} products={safeProducts} onSuccess={loadProducts} />
            <ProductDialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} product={selectedProduct} onSuccess={loadProducts} />
            {selectedProduct && <StockHistoryDialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen} product={selectedProduct} />}
        </>
    );
};

export default StockManagement;