
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useBusiness } from '@/contexts/BusinessContext';
import { useUserRole } from '@/hooks/useUserRole';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';

// Components
import StockValuationCard from '@/components/retail/StockValuationCard';
import ProductTable from '@/components/retail/ProductTable';
import LowStockAlerts from '@/components/retail/LowStockAlerts';
import CategoryChips from '@/components/retail/CategoryChips';
import ProductForm from '@/components/retail/ProductForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Search, Package } from 'lucide-react';

const StockPage = () => {
    const { activeBusiness } = useBusiness();
    const { canDelete, canEdit } = useUserRole();

    const businessId = activeBusiness?.id;
    const businessName = activeBusiness?.name;

    // Data States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [valuation, setValuation] = useState(null);
    
    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all'); // all, low, out
    
    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    // Initial Load
    useEffect(() => {
        if (businessId) {
            loadInitialData();
        } else {
            setIsLoading(false);
        }
    }, [businessId]);

    // Search & Filter Effect
    useEffect(() => {
        if (!businessId) return;
        
        const timer = setTimeout(() => {
            loadProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, categoryFilter, stockFilter, businessId]);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadCategories(),
                loadValuation(),
                loadLowStock(),
                loadProducts()
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProducts = async () => {
        const filters = { 
            categoryId: categoryFilter,
            search: search,
            stockStatus: stockFilter
        };
        const { data, error } = await productService.getProductsByBusiness(businessId, filters);
        
        if (error) {
            setError(error);
        } else {
            setProducts(data);
            setError(null);
        }
    };

    const loadCategories = async () => {
        const { data } = await categoryService.getCategoriesByBusiness(businessId);
        setCategories(data || []);
    };

    const loadValuation = async () => {
        const { data } = await productService.calculateStockValuation(businessId);
        setValuation(data);
    };

    const loadLowStock = async () => {
        const { data } = await productService.getLowStockProducts(businessId);
        setLowStockProducts(data || []);
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDelete = async (productId) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { error } = await productService.deleteProduct(businessId, productId);
        if (error) {
            showErrorToast(error);
        } else {
            showSuccessToast("Product deleted");
            // Refresh data
            loadProducts();
            loadValuation();
            loadLowStock();
        }
    };

    const handleSuccess = () => {
        loadInitialData();
    };

    if (!businessId) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p>No active business selected.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 p-6 animate-in fade-in duration-500">
            <Helmet><title>Products & Stock | {businessName}</title></Helmet>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Package className="h-8 w-8 text-blue-500" />
                        Products & Stock
                    </h1>
                    <p className="text-slate-400">Manage inventory and track stock levels</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" disabled>
                        <Upload className="mr-2 h-4 w-4" /> Import (Coming Soon)
                    </Button>
                    {canEdit && (
                        <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20" size="sm" onClick={() => { setEditProduct(null); setIsProductModalOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    )}
                </div>
            </div>

            {/* Valuation */}
            <StockValuationCard 
                {...valuation} 
                isLoading={isLoading && !valuation} 
                error={error} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="space-y-6">
                    <LowStockAlerts products={lowStockProducts} isLoading={isLoading && !lowStockProducts} />
                    
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-300">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-xs text-slate-400">Stock Status</label>
                                <Select value={stockFilter} onValueChange={setStockFilter}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700 h-9 text-slate-300"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                                        <SelectItem value="all">All Items</SelectItem>
                                        <SelectItem value="low">Low Stock</SelectItem>
                                        <SelectItem value="out">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Table */}
                <Card className="lg:col-span-3 bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input 
                                    placeholder="Search products..." 
                                    className="pl-8 bg-slate-950 border-slate-700 h-9 text-slate-200 focus:ring-slate-700" 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CategoryChips 
                            categories={categories} 
                            selectedCategory={categoryFilter} 
                            onSelectCategory={setCategoryFilter} 
                            isLoading={isLoading && !categories.length}
                        />
                        
                        <ProductTable 
                            products={products} 
                            isLoading={isLoading && !products} 
                            error={error} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete}
                            canDelete={canDelete}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <ProductForm 
                isOpen={isProductModalOpen} 
                onClose={() => setIsProductModalOpen(false)} 
                mode={editProduct ? 'edit' : 'create'}
                product={editProduct}
                businessId={businessId}
                categories={categories}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default StockPage;
