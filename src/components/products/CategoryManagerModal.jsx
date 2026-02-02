
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryService } from '@/services/categoryService';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';
import { validateCategory } from '@/utils/validation';
import { Trash2, Edit2, Loader2 } from 'lucide-react';

const CategoryManagerModal = ({ isOpen, onClose, businessId, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && businessId) loadCategories();
    }, [isOpen, businessId]);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategoriesByBusiness(businessId);
            setCategories(data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async () => {
        const { isValid, errors } = validateCategory({ name: newCatName });
        if (!isValid) {
            showErrorToast(errors.name);
            return;
        }

        setLoading(true);
        try {
            await categoryService.createCategory(businessId, { name: newCatName, description: newCatDesc });
            showSuccessToast("Category created");
            setNewCatName('');
            setNewCatDesc('');
            loadCategories();
            onSuccess();
        } catch (err) {
            showErrorToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        
        try {
            await categoryService.deleteCategory(businessId, id);
            showSuccessToast("Category deleted");
            loadCategories();
            onSuccess();
        } catch (err) {
            showErrorToast(err.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
                <Tabs defaultValue="list">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-950">
                        <TabsTrigger value="list">All Categories</TabsTrigger>
                        <TabsTrigger value="add">Add New</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="list" className="space-y-2 mt-4 max-h-[300px] overflow-auto">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-800">
                                <div>
                                    <p className="font-medium">{cat.name}</p>
                                    <p className="text-xs text-slate-500">{cat.product_count || 0} products</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(cat.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} className="bg-slate-950 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className="bg-slate-950 border-slate-700" />
                        </div>
                        <Button className="w-full bg-blue-600" onClick={handleCreate} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryManagerModal;
