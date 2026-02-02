import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusiness } from '@/contexts/BusinessContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit2, Check, X } from 'lucide-react';

const CategoryManagerDialog = ({ open, onOpenChange, onSuccess }) => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (activeBusiness && open) loadCategories();
    }, [activeBusiness, open]);

    const loadCategories = async () => {
        const data = await mockDatabase.getCategories(activeBusiness.id);
        setCategories(data);
        if (onSuccess) onSuccess(); // Refresh parent if needed
    };

    const handleCreate = async () => {
        if (newCatName.trim().length < 3) {
            toast({ title: "Error", description: "Name must be at least 3 characters", variant: "destructive" });
            return;
        }
        try {
            await mockDatabase.createCategory(activeBusiness.id, { name: newCatName });
            setNewCatName('');
            toast({ title: "Category Created" });
            loadCategories();
        } catch (e) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        try {
            await mockDatabase.deleteCategory(id);
            toast({ title: "Category Deleted" });
            loadCategories();
        } catch (e) {
            toast({ title: "Cannot Delete", description: e.message, variant: "destructive" });
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const saveEdit = async () => {
        try {
            await mockDatabase.updateCategory(editingId, { name: editName });
            setEditingId(null);
            loadCategories();
        } catch (e) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-950">
                        <TabsTrigger value="list">All Categories</TabsTrigger>
                        <TabsTrigger value="add">Add New</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="list" className="space-y-4 max-h-[300px] overflow-auto mt-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 border border-slate-800 rounded bg-slate-950/50">
                                {editingId === cat.id ? (
                                    <div className="flex gap-2 flex-1">
                                        <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8" />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={saveEdit}><Check className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{cat.name}</span>
                                            <span className="text-xs text-slate-500">{cat.product_count} products</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => startEdit(cat)}><Edit2 className="h-3 w-3" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="add" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Snacks" className="bg-slate-950 border-slate-700" />
                        </div>
                        <Button className="w-full bg-blue-600" onClick={handleCreate}>Create Category</Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryManagerDialog;