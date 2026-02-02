import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // For editing
    const { toast } = useToast();
    const { user, profile } = useAuth();
    
    // Form State
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: '' });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Assuming we have the business_id from profile or we fetch the user's business
            const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
            if (business) {
                 const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('business_id', business.id)
                    .ilike('name', `%${search}%`);
                 
                 // Ensure we set an array even if data is null
                 if (!error) setProducts(data || []);
                 else setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user) fetchProducts();
    }, [user, search]);

    const handleSubmit = async () => {
        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
        if (!business) return;

        try {
            if (currentProduct) {
                // Update
                const { error } = await supabase.from('products').update({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    stock_quantity: parseInt(formData.stock),
                }).eq('id', currentProduct.id);
                if (error) throw error;
                toast({ title: "Success", description: "Product updated" });
            } else {
                // Create
                const { error } = await supabase.from('products').insert({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    stock_quantity: parseInt(formData.stock),
                    business_id: business.id
                });
                if (error) throw error;
                toast({ title: "Success", description: "Product created" });
            }
            setIsDialogOpen(false);
            fetchProducts();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } else {
            toast({ title: "Deleted", description: "Product removed" });
            fetchProducts();
        }
    };

    const openEdit = (product) => {
        setCurrentProduct(product);
        setFormData({ name: product.name, price: product.price, stock: product.stock_quantity, category: '' });
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setCurrentProduct(null);
        setFormData({ name: '', price: '', stock: '', category: '' });
        setIsDialogOpen(true);
    };

    // Defensive check for rendering
    const safeProducts = Array.isArray(products) ? products : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Products</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Price</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                                <div><Label>Stock</Label><Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                            </div>
                            <Button className="w-full" onClick={handleSubmit}>Save Product</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : safeProducts.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
                        ) : (
                            safeProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>৳{product.price}</TableCell>
                                    <TableCell>{product.stock_quantity}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ProductManagement;