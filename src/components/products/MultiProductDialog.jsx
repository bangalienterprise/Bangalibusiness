import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useBusiness } from '@/contexts/BusinessContext';
import { Trash2, Plus, Save } from 'lucide-react';

const MultiProductDialog = ({ open, onOpenChange, onSuccess }) => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    
    // Initial 5 rows
    const [rows, setRows] = useState(
        Array(5).fill(null).map(() => ({
            sku: '', name: '', category_id: '', unit: 'pcs', cost: '', price: '', qty: ''
        }))
    );

    useEffect(() => {
        if (activeBusiness && open) {
            mockDatabase.getCategories(activeBusiness.id).then(setCategories);
        }
    }, [activeBusiness, open]);

    const updateRow = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { sku: '', name: '', category_id: '', unit: 'pcs', cost: '', price: '', qty: '' }]);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const handleSave = async () => {
        // Filter valid rows (must have name and category)
        const validRows = rows.filter(r => r.name.trim() !== '' && r.category_id !== '');
        
        if (validRows.length === 0) {
            toast({ title: "Empty Data", description: "Please fill in at least one product with name and category.", variant: "destructive" });
            return;
        }

        try {
            let count = 0;
            for (const row of validRows) {
                await mockDatabase.createProduct(activeBusiness.id, {
                    name: row.name,
                    sku: row.sku || `SKU-${Date.now()}-${count}`,
                    category_id: row.category_id,
                    unit_type: row.unit,
                    buying_price: Number(row.cost) || 0,
                    selling_price: Number(row.price) || 0,
                    stock_quantity: Number(row.qty) || 0,
                    min_stock_alert: 5
                });
                count++;
            }
            toast({ title: "Batch Import Successful", description: `Added ${count} products.` });
            onSuccess();
            onOpenChange(false);
            // Reset rows
            setRows(Array(5).fill(null).map(() => ({ sku: '', name: '', category_id: '', unit: 'pcs', cost: '', price: '', qty: '' })));
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-5xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Product Entry</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto border border-slate-800 rounded-md">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 border-b border-slate-800 w-10">#</th>
                                <th className="p-2 border-b border-slate-800">SKU (Opt)</th>
                                <th className="p-2 border-b border-slate-800 w-48">Name *</th>
                                <th className="p-2 border-b border-slate-800 w-32">Category *</th>
                                <th className="p-2 border-b border-slate-800 w-24">Unit</th>
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
                                    <td className="p-1">
                                        <Input className="h-8 bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-blue-500" value={row.sku} onChange={e => updateRow(i, 'sku', e.target.value)} placeholder="Auto" />
                                    </td>
                                    <td className="p-1">
                                        <Input className="h-8 bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-blue-500" value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="Product Name" />
                                    </td>
                                    <td className="p-1">
                                        <select 
                                            className="w-full h-8 bg-transparent text-white border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                            value={row.category_id}
                                            onChange={e => updateRow(i, 'category_id', e.target.value)}
                                        >
                                            <option value="" className="bg-slate-900">Select...</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1">
                                        <select 
                                            className="w-full h-8 bg-transparent text-white border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                            value={row.unit}
                                            onChange={e => updateRow(i, 'unit', e.target.value)}
                                        >
                                            <option value="pcs" className="bg-slate-900">pcs</option>
                                            <option value="kg" className="bg-slate-900">kg</option>
                                            <option value="liter" className="bg-slate-900">liter</option>
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
                        <Button variant="ghost" size="sm" onClick={addRow} className="text-blue-400 hover:text-blue-300">
                            <Plus className="h-4 w-4 mr-2" /> Add Row
                        </Button>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500">
                        <Save className="h-4 w-4 mr-2" /> Save All Products
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MultiProductDialog;