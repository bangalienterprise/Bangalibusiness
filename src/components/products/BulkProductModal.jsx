
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';

const BulkProductModal = ({ isOpen, onClose, businessId, onSuccess }) => {
    const [rows, setRows] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && businessId) {
            loadCategories();
            resetRows();
        }
    }, [isOpen, businessId]);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategoriesByBusiness(businessId);
            setCategories(data);
        } catch (err) { console.error(err); }
    };

    const resetRows = () => {
        setRows(Array(10).fill(null).map(() => ({
            sku: '', name: '', category_id: '', unit: 'pcs', cost: '', price: '', qty: '', min: 5
        })));
    };

    const updateRow = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { sku: '', name: '', category_id: '', unit: 'pcs', cost: '', price: '', qty: '', min: 5 }]);
    };

    const removeRow = (index) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {
        const validRows = rows.filter(r => r.name.trim() !== '' && r.category_id !== '');
        
        if (validRows.length === 0) {
            showErrorToast("Please fill at least one row with Name and Category");
            return;
        }

        setLoading(true);
        try {
            const payload = validRows.map(r => ({
                sku: r.sku || `SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                name: r.name,
                category_id: r.category_id,
                unit_type: r.unit,
                buying_price: Number(r.cost) || 0,
                selling_price: Number(r.price) || 0,
                stock_qty: Number(r.qty) || 0,
                min_stock_alert: Number(r.min) || 5
            }));

            await productService.bulkCreateProducts(businessId, payload);
            showSuccessToast(`Successfully added ${validRows.length} products`);
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
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-6xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Add Products</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto border border-slate-800 rounded-md">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 border-b border-slate-800 w-10">#</th>
                                <th className="p-2 border-b border-slate-800">SKU (Opt)</th>
                                <th className="p-2 border-b border-slate-800 w-48">Name *</th>
                                <th className="p-2 border-b border-slate-800 w-32">Category *</th>
                                <th className="p-2 border-b border-slate-800 w-20">Unit</th>
                                <th className="p-2 border-b border-slate-800 w-24">Cost</th>
                                <th className="p-2 border-b border-slate-800 w-24">Price</th>
                                <th className="p-2 border-b border-slate-800 w-20">Qty</th>
                                <th className="p-2 border-b border-slate-800 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="p-2 text-slate-500">{i + 1}</td>
                                    <td className="p-1"><Input className="h-8 bg-transparent border-0" value={row.sku} onChange={e => updateRow(i, 'sku', e.target.value)} placeholder="Auto" /></td>
                                    <td className="p-1"><Input className="h-8 bg-transparent border-0" value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} /></td>
                                    <td className="p-1">
                                        <select className="w-full h-8 bg-transparent text-white border-0 rounded focus:ring-1 focus:ring-blue-500" value={row.category_id} onChange={e => updateRow(i, 'category_id', e.target.value)}>
                                            <option value="" className="bg-slate-900">Select...</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1">
                                        <select className="w-full h-8 bg-transparent text-white border-0 rounded focus:ring-1 focus:ring-blue-500" value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)}>
                                            <option value="pcs" className="bg-slate-900">pcs</option>
                                            <option value="kg" className="bg-slate-900">kg</option>
                                            <option value="box" className="bg-slate-900">box</option>
                                        </select>
                                    </td>
                                    <td className="p-1"><Input type="number" className="h-8 bg-transparent border-0" value={row.cost} onChange={e => updateRow(i, 'cost', e.target.value)} /></td>
                                    <td className="p-1"><Input type="number" className="h-8 bg-transparent border-0" value={row.price} onChange={e => updateRow(i, 'price', e.target.value)} /></td>
                                    <td className="p-1"><Input type="number" className="h-8 bg-transparent border-0" value={row.qty} onChange={e => updateRow(i, 'qty', e.target.value)} /></td>
                                    <td className="p-1 text-center">
                                        <button onClick={() => removeRow(i)} className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-2 border-t border-slate-800">
                        <Button variant="ghost" size="sm" onClick={addRow} className="text-blue-400">
                            <Plus className="h-4 w-4 mr-2" /> Add Row
                        </Button>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Products
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BulkProductModal;
