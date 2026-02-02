import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';

const ProductForm = ({ open, onOpenChange, product, onSuccess }) => {
    const { user, hasPermission } = useAuth();
    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const canSeeCost = hasPermission('CAN_SEE_COST');

    useEffect(() => {
        if (product) {
            setValue('name', product.name);
            setValue('sku', product.sku);
            setValue('category', product.category);
            setValue('stock', product.stock);
            setValue('selling_price', product.selling_price);
            setValue('buying_price', product.buying_price);
            setValue('description', product.description);
        } else {
            reset();
            setValue('category', 'Electronics'); // Default
        }
    }, [product, open, reset, setValue]);

    const onSubmit = async (data) => {
        try {
            const productData = {
                ...data,
                stock: parseInt(data.stock),
                selling_price: parseFloat(data.selling_price),
                buying_price: data.buying_price ? parseFloat(data.buying_price) : 0,
                business_id: user.business_id
            };

            if (product) {
                await mockDatabase.update('products', product.id, productData);
                toast({ title: "Success", description: "Product updated successfully." });
            } else {
                await mockDatabase.create('products', productData);
                toast({ title: "Success", description: "Product created successfully." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Product Name *</Label>
                            <Input {...register('name', { required: true })} className="bg-slate-950 border-slate-700" placeholder="Product Name" />
                            {errors.name && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>SKU *</Label>
                            <Input {...register('sku', { required: true })} className="bg-slate-950 border-slate-700" placeholder="SKU-123" />
                            {errors.sku && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select onValueChange={(val) => setValue('category', val)} defaultValue={product?.category || "Electronics"}>
                            <SelectTrigger className="bg-slate-950 border-slate-700">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Groceries">Groceries</SelectItem>
                                <SelectItem value="Clothing">Clothing</SelectItem>
                                <SelectItem value="Home">Home</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Selling Price *</Label>
                            <Input type="number" {...register('selling_price', { required: true })} className="bg-slate-950 border-slate-700" />
                        </div>
                        {canSeeCost && (
                            <div className="space-y-2">
                                <Label>Buying Price (Cost)</Label>
                                <Input type="number" {...register('buying_price')} className="bg-slate-950 border-slate-700" />
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                         <Label>Stock Quantity *</Label>
                         <Input type="number" {...register('stock', { required: true })} className="bg-slate-950 border-slate-700" />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea {...register('description')} className="bg-slate-950 border-slate-700" placeholder="Optional details..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Save Product</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductForm;