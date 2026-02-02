
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Tag, Loader2 } from 'lucide-react';

const CategoriesPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        if (business?.id) {
            fetchCategories();
        }
    }, [business]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('business_id', business.id)
                .order('name');
            if (error) throw error;
            setCategories(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load categories" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;
        setSaving(true);
        try {
            if (editingCategory) {
                const { error } = await supabase.from('categories')
                    .update({ name: categoryName })
                    .eq('id', editingCategory.id);
                if (error) throw error;
                toast({ title: "Category updated" });
            } else {
                const { error } = await supabase.from('categories')
                    .insert({ business_id: business.id, name: categoryName });
                if (error) throw error;
                toast({ title: "Category created" });
            }
            setIsDialogOpen(false);
            setCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            toast({ variant: "destructive", title: "Operation failed" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Category deleted" });
            fetchCategories();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Categories - Bangali Enterprise</title></Helmet>
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Categories</h1>
                    <p className="text-slate-400">Organize your products.</p>
                </div>
                <Button onClick={() => { setEditingCategory(null); setCategoryName(''); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>
                ) : categories.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">No categories found. Create one to get started.</div>
                ) : (
                    categories.map(cat => (
                        <Card key={cat.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                        <Tag className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-white">{cat.name}</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setIsDialogOpen(true); }}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => handleDelete(cat.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} className="bg-slate-900 border-slate-700" placeholder="e.g., Electronics" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-slate-700 text-white">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {saving ? 'Saving...' : 'Save Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoriesPage;
