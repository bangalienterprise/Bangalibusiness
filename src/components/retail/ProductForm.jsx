
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { productService } from '@/services/productService';
import { validateProduct } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';
import { Loader2 } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, mode = 'create', product, businessId, categories, onSuccess }) => {
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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && product) {
                setFormData({
                    sku: product.sku || '',
                    name: product.name || '',
                    category_id: product.category_id || '',
                    unit_type: product.unit_type || 'pcs',
                    buying_price: product.buying_price || '',
                    selling_price: product.selling_price || '',
                    stock_qty: product.stock_qty || product.stock_quantity || 0,
                    min_stock_alert: product.min_stock_alert || product.alert_qty || 5,
                    image_url: product.image_url || '',
                    description: product.description || ''
                });
            } else {
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
            setErrors([]);
        }
    }, [mode, product, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!businessId) {
            showErrorToast("Business ID missing");
            return;
        }

        // 1. Validation
        const { isValid, errors: validationErrors } = validateProduct(formData);
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            // 2. Submit
            let result;
            if (mode === 'create') {
                result = await productService.createProduct(businessId, formData);
            } else {
                if (!product?.id) throw new Error("Product ID missing");
                result = await productService.updateProduct(businessId, product.id, formData);
            }

            if (result.error) throw new Error(result.error);

            showSuccessToast(`Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            showErrorToast(err.message);
            // Don't close modal on error so user can fix
        } finally {
            setLoading(false);
        }
    };

    if (!businessId && isOpen) return null; // Or show error dialog

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
                </DialogHeader>
                
                {errors.length > 0 && (
                    <div className="bg-red-950/30 border border-red-900 p-3 rounded mb-4">
                        <ul className="list-disc list-inside text-sm text-red-400">
                            {errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SKU <span className="text-red-500">*</span></Label>
                            <Input 
                                value={formData.sku} 
                                onChange={e => handleChange('sku', e.target.value)} 
                                className="bg-slate-950 border-slate-700" 
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit Type</Label>
                            <Select value={formData.unit_type} onValueChange={v => handleChange('unit_type', v)} disabled={loading}>
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
                        <Label>Product Name <span className="text-red-500">*</span></Label>
                        <Input 
                            value={formData.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            className="bg-slate-950 border-slate-700" 
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category_id} onValueChange={v => handleChange('category_id', v)} disabled={loading}>
                            <SelectTrigger className="bg-slate-950 border-slate-700">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                                {categories && categories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cost Price <span className="text-red-500">*</span></Label>
                            <Input 
                                type="number" 
                                step="0.01" 
                                value={formData.buying_price} 
                                onChange={e => handleChange('buying_price', e.target.value)} 
                                className="bg-slate-950 border-slate-700" 
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Selling Price <span className="text-red-500">*</span></Label>
                            <Input 
                                type="number" 
                                step="0.01" 
                                value={formData.selling_price} 
                                onChange={e => handleChange('selling_price', e.target.value)} 
                                className="bg-slate-950 border-slate-700" 
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stock Quantity <span className="text-red-500">*</span></Label>
                            <Input 
                                type="number" 
                                value={formData.stock_qty} 
                                onChange={e => handleChange('stock_qty', e.target.value)} 
                                className="bg-slate-950 border-slate-700" 
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Stock Alert <span className="text-red-500">*</span></Label>
                            <Input 
                                type="number" 
                                value={formData.min_stock_alert} 
                                onChange={e => handleChange('min_stock_alert', e.target.value)} 
                                className="bg-slate-950 border-slate-700" 
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={formData.description} 
                            onChange={e => handleChange('description', e.target.value)} 
                            className="bg-slate-950 border-slate-700" 
                            disabled={loading}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Create Product' : 'Update Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductForm;
