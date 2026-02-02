
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { validateProduct } from '@/utils/validation';
import { isSkuUnique } from '@/utils/skuValidator';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';
import { Loader2 } from 'lucide-react';

const ProductFormModal = ({ isOpen, onClose, mode = 'create', product, businessId, onSuccess }) => {
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category_id: '',
        unit_type: 'pcs',
        buying_price: '',
        selling_price: '',
        stock_qty: '',
        min_stock_alert: 5,
        image_url: '',
        description: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && businessId) {
            loadCategories();
        }
    }, [isOpen, businessId]);

    useEffect(() => {
        if (mode === 'edit' && product) {
            setFormData({
                sku: product.sku || '',
                name: product.name || '',
                category_id: product.category_id || '',
                unit_type: product.unit_type || 'pcs',
                buying_price: product.buying_price || '',
                selling_price: product.selling_price || '',
                stock_qty: product.stock_qty || '',
                min_stock_alert: product.min_stock_alert || 5,
                image_url: product.image_url || '',
                description: product.description || ''
            });
        } else {
            // Reset or generate default SKU
            setFormData({
                sku: `SKU-${Date.now().toString().slice(-6)}`,
                name: '',
                category_id: '',
                unit_type: 'pcs',
                buying_price: '',
                selling_price: '',
                stock_qty: '',
                min_stock_alert: 5,
                image_url: '',
                description: ''
            });
        }
        setErrors({});
    }, [mode, product, isOpen]);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategoriesByBusiness(businessId);
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Validation
        const { isValid, errors: validationErrors } = validateProduct(formData);
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            // 2. Check SKU Uniqueness (if changed or new)
            if (mode === 'create' || (mode === 'edit' && product.sku !== formData.sku)) {
                const unique = await isSkuUnique(businessId, formData.sku, mode === 'edit' ? product.id : null);
                if (!unique) {
                    setErrors({ sku: "SKU must be unique" });
                    setLoading(false);
                    return;
                }
            }

            // 3. Submit
            if (mode === 'create') {
                await productService.createProduct(businessId, formData);
                showSuccessToast("Product created successfully");
            } else {
                await productService.updateProduct(businessId, product.id, formData);
                showSuccessToast("Product updated successfully");
            }
            
            onSuccess();
            onClose();
        } catch (err) {
            showErrorToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SKU {errors.sku && <span className="text-red-500 text-xs">{errors.sku}</span>}</Label>
                            <Input 
                                value={formData.sku} 
                                onChange={e => handleChange('sku', e.target.value)} 
                                className={`bg-slate-950 border-slate-700 ${errors.sku ? 'border-red-500' : ''}`} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit Type</Label>
                            <Select value={formData.unit_type} onValueChange={v => handleChange('unit_type', v)}>
                                <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue/></SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                    <SelectItem value="liter">Liter (L)</SelectItem>
                                    <SelectItem value="box">Box</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Product Name {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}</Label>
                        <Input 
                            value={formData.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            className={`bg-slate-950 border-slate-700 ${errors.name ? 'border-red-500' : ''}`} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Category {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}</Label>
                        <Select value={formData.category_id} onValueChange={v => handleChange('category_id', v)}>
                            <SelectTrigger className={`bg-slate-950 border-slate-700 ${errors.category ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                                {categories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cost Price {errors.buying_price && <span className="text-red-500 text-xs">{errors.buying_price}</span>}</Label>
                            <Input type="number" value={formData.buying_price} onChange={e => handleChange('buying_price', e.target.value)} className="bg-slate-950 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Selling Price {errors.selling_price && <span className="text-red-500 text-xs">{errors.selling_price}</span>}</Label>
                            <Input type="number" value={formData.selling_price} onChange={e => handleChange('selling_price', e.target.value)} className="bg-slate-950 border-slate-700" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stock Quantity {errors.stock_qty && <span className="text-red-500 text-xs">{errors.stock_qty}</span>}</Label>
                            <Input type="number" value={formData.stock_qty} onChange={e => handleChange('stock_qty', e.target.value)} className="bg-slate-950 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Stock Alert</Label>
                            <Input type="number" value={formData.min_stock_alert} onChange={e => handleChange('min_stock_alert', e.target.value)} className="bg-slate-950 border-slate-700" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={formData.description} onChange={e => handleChange('description', e.target.value)} className="bg-slate-950 border-slate-700" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Create Product' : 'Update Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductFormModal;
