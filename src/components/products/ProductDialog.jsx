import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import CategoryManagerDialog from '@/components/stock/CategoryManagerDialog'; // Forward ref to this later

const ProductDialog = ({ open, onOpenChange, product, onSuccess }) => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [catManagerOpen, setCatManagerOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category_id: '',
        unit_type: 'pcs',
        buying_price: '',
        selling_price: '',
        stock_quantity: '',
        min_stock_alert: 5
    });

    useEffect(() => {
        if (activeBusiness) {
            loadCategories();
        }
    }, [activeBusiness, catManagerOpen]);

    const loadCategories = async () => {
        const cats = await mockDatabase.getCategories(activeBusiness.id);
        setCategories(cats);
    };

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                category_id: product.category_id,
                unit_type: product.unit_type || 'pcs',
                buying_price: product.buying_price,
                selling_price: product.selling_price,
                stock_quantity: product.stock,
                min_stock_alert: product.min_stock_alert
            });
        } else {
            setFormData({
                name: '',
                sku: `SKU-${Math.floor(Math.random() * 10000)}`, // Auto-gen
                category_id: '',
                unit_type: 'pcs',
                buying_price: '',
                selling_price: '',
                stock_quantity: '',
                min_stock_alert: 5
            });
        }
    }, [product, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.category_id) {
                toast({ title: "Validation Error", description: "Name and Category are required", variant: "destructive" });
                return;
            }

            const payload = {
                ...formData,
                buying_price: Number(formData.buying_price),
                selling_price: Number(formData.selling_price),
                stock_quantity: Number(formData.stock_quantity),
                min_stock_alert: Number(formData.min_stock_alert)
            };

            if (product) {
                await mockDatabase.updateProduct(product.id, payload);
                toast({ title: "Product Updated" });
            } else {
                await mockDatabase.createProduct(activeBusiness.id, payload);
                toast({ title: "Product Created" });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="bg-slate-950 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit Type</Label>
                                <Select value={formData.unit_type} onValueChange={v => setFormData({...formData, unit_type: v})}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800">
                                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                        <SelectItem value="liter">Liter (L)</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="dozen">Dozen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-950 border-slate-700" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <div className="flex gap-2">
                                <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800">
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" size="icon" variant="outline" className="border-slate-700" onClick={() => setCatManagerOpen(true)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Buying Price (Cost)</Label>
                                <Input type="number" value={formData.buying_price} onChange={e => setFormData({...formData, buying_price: e.target.value})} className="bg-slate-950 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Selling Price</Label>
                                <Input type="number" value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} className="bg-slate-950 border-slate-700" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Current Stock</Label>
                                <Input type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="bg-slate-950 border-slate-700" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Low Stock Alert Limit</Label>
                                <Input type="number" value={formData.min_stock_alert} onChange={e => setFormData({...formData, min_stock_alert: e.target.value})} className="bg-slate-950 border-slate-700" />
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600">Save Product</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            {/* Lazy load to prevent cycle */}
            {catManagerOpen && <CategoryManagerDialog open={catManagerOpen} onOpenChange={setCatManagerOpen} />}
        </>
    );
};

export default ProductDialog;