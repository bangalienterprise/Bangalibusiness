
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const ProductsPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', sku: '', category_id: '', buying_price: '', selling_price: '', stock_quantity: '', alert_qty: '5'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (business?.id) {
            fetchProducts();
            fetchCategories();
        }
    }, [business]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name)')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed to load products" });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').eq('business_id', business.id);
        setCategories(data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                business_id: business.id,
                updated_at: new Date() // Add update timestamp logic ideally
            };

            let error;
            if (editingProduct) {
                const { error: err } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
                error = err;
            } else {
                const { error: err } = await supabase.from('products').insert(payload);
                error = err;
            }

            if (error) throw error;
            
            toast({ title: "Success", description: `Product ${editingProduct ? 'updated' : 'created'} successfully` });
            setIsDialogOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Operation failed", description: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Product deleted" });
            fetchProducts();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', sku: '', category_id: '', buying_price: '', selling_price: '', stock_quantity: '', alert_qty: '5' });
        setEditingProduct(null);
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku || '',
            category_id: product.category_id || '',
            buying_price: product.buying_price,
            selling_price: product.selling_price,
            stock_quantity: product.stock_quantity,
            alert_qty: product.alert_qty || '5'
        });
        setIsDialogOpen(true);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Products - Bangali Enterprise</title></Helmet>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products</h1>
                    <p className="text-slate-400">Manage your inventory and pricing.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <Search className="h-5 w-5 text-slate-400" />
                <Input 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-slate-500"
                />
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Category</TableHead>
                            <TableHead className="text-slate-400">Price</TableHead>
                            <TableHead className="text-slate-400">Stock</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No products found</TableCell></TableRow>
                        ) : (
                            filteredProducts.map(product => (
                                <TableRow key={product.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-medium text-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-slate-700 flex items-center justify-center text-slate-400">
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div>{product.name}</div>
                                                <div className="text-xs text-slate-500">{product.sku}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">{product.category?.name || '-'}</TableCell>
                                    <TableCell className="text-slate-300">
                                        <div>Sell: ৳{product.selling_price}</div>
                                        <div className="text-xs text-slate-500">Buy: ৳{product.buying_price}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock_quantity <= product.alert_qty ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {product.stock_quantity} Units
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)} className="text-blue-400 hover:bg-blue-900/20"><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-red-400 hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Product Name</Label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>SKU (Optional)</Label>
                                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category_id} onValueChange={val => setFormData({...formData, category_id: val})}>
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Buying Price</Label>
                                <Input type="number" required value={formData.buying_price} onChange={e => setFormData({...formData, buying_price: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Selling Price</Label>
                                <Input type="number" required value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Initial Stock</Label>
                                <Input type="number" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                             <div className="space-y-2">
                                <Label>Low Stock Alert At</Label>
                                <Input type="number" value={formData.alert_qty} onChange={e => setFormData({...formData, alert_qty: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-slate-700 text-white">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductsPage;
