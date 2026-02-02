import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package, Settings, AlertTriangle, Download, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import SuspenseLoader from '@/components/SuspenseLoader';
import ProductForm from '@/components/Stock/ProductForm';
import { useToast } from '@/components/ui/use-toast';
import { mockDatabase } from '@/services/MockDatabase';
import Papa from 'papaparse';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const StockPage = () => {
    const { user, hasPermission } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Permissions
    const canSeeCost = hasPermission('CAN_SEE_COST');
    const canManage = user.role === 'owner' || user.role === 'manager'; // Basic role check for managing products

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.business_id) return;
        setLoading(true);
        try {
            const data = await mockDatabase.getAll('products', user.business_id);
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, activeCategory, searchTerm]);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        try {
            await mockDatabase.delete('products', productToDelete.id);
            toast({ title: "Deleted", description: "Product deleted successfully" });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
    };

    const handleExport = () => {
        const csvData = filteredProducts.map(p => {
            const base = {
                Name: p.name,
                SKU: p.sku,
                Category: p.category,
                Stock: p.stock,
                'Selling Price': p.selling_price,
            };
            if (canSeeCost) {
                base['Cost Price'] = p.buying_price;
                base['Total Value'] = p.stock * p.buying_price;
            }
            return base;
        });
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `stock_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
    };

    if (loading) return <SuspenseLoader />;

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Stock Management - Bangali Enterprise</title>
            </Helmet>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Stock Management</h1>
                    <p className="text-slate-400">Manage inventory, products, and pricing.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport} className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    {canManage && (
                        <Button onClick={() => { setSelectedProduct(null); setIsProductDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-500">
                            <Plus className="h-4 w-4 mr-2" /> New Product
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                                activeCategory === cat 
                                    ? "bg-blue-600 text-white shadow-md" 
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                            )}
                        >
                            {cat === 'All' && <Package className="h-4 w-4" />}
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-900 border-slate-700 text-white"
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                    const profitMargin = product.buying_price > 0 
                        ? ((product.selling_price - product.buying_price) / product.buying_price * 100).toFixed(1) 
                        : 0;

                    return (
                        <Card key={product.id} className="group bg-slate-800 border-slate-700 text-white hover:border-slate-600 transition-colors">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="text-[10px] bg-slate-700 text-slate-300 hover:bg-slate-600">{product.category}</Badge>
                                    {product.stock <= 10 && (
                                        <Badge variant="destructive" className="text-[10px] flex items-center gap-1 bg-red-500/20 text-red-400 border-red-500/50">
                                            <AlertTriangle className="h-3 w-3" /> Low
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg font-bold line-clamp-1 mt-2" title={product.name}>
                                    {product.name}
                                </CardTitle>
                                <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                    <div>
                                        <p className="text-slate-500 text-xs">Stock</p>
                                        <p className={cn("font-bold text-lg", product.stock === 0 ? "text-red-400" : "text-white")}>
                                            {product.stock}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 text-xs">Price</p>
                                        <p className="font-mono font-bold text-lg">৳{product.selling_price}</p>
                                    </div>
                                    {canSeeCost && (
                                        <>
                                            <div className="col-span-2 pt-2 border-t border-slate-700 flex justify-between items-center mt-1">
                                                <div className="text-xs">
                                                    <span className="text-slate-500">Cost: </span>
                                                    <span className="text-slate-300 font-mono">৳{product.buying_price}</span>
                                                </div>
                                                <Badge variant="outline" className={cn("text-[10px] border-slate-600", profitMargin > 0 ? "text-green-400" : "text-red-400")}>
                                                    {profitMargin}% Mgn
                                                </Badge>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {canManage && (
                                    <div className="flex gap-2 pt-2 border-t border-slate-700">
                                        <Button size="sm" variant="ghost" className="flex-1 h-8 text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => handleEdit(product)}>
                                            <Edit className="h-3 w-3 mr-1" /> Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => handleDeleteClick(product)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                        <Package className="h-12 w-12 mb-4 opacity-20" />
                        <p>No products found.</p>
                    </div>
                )}
            </div>

            <ProductForm 
                open={isProductDialogOpen} 
                onOpenChange={setIsProductDialogOpen} 
                product={selectedProduct} 
                onSuccess={loadData} 
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                    <div className="flex gap-3 justify-end pt-4">
                        <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default StockPage;