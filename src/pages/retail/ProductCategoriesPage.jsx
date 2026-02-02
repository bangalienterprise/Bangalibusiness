import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layers, Plus, Pencil, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryService } from '@/services/CategoryService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ProductCategoriesPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [catName, setCatName] = useState('');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.business_id) return;
        const { data, error } = await categoryService.getCategories(user.business_id);
        if (!error) {
            setCategories(data || []);
        }
    };

    const handleSave = async () => {
        if (!catName.trim()) return;
        try {
            await categoryService.createCategory(user.business_id, {
                name: catName
            });
            setCatName('');
            setOpen(false);
            loadData();
            toast({ title: "Category Created" });
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <Helmet><title>Product Categories</title></Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Categories</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label>Category Name</Label>
                            <Input value={catName} onChange={e => setCatName(e.target.value)} className="bg-slate-950 border-slate-700" placeholder="e.g., Electronics" />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-blue-600">Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-500" /> All Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="text-slate-400">Category Name</TableHead>
                                <TableHead className="text-slate-400">ID</TableHead>
                                <TableHead className="text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-8 text-slate-500">No categories found.</TableCell></TableRow>
                            ) : (
                                categories.map(cat => (
                                    <TableRow key={cat.id} className="border-slate-800">
                                        <TableCell className="font-medium text-white">{cat.name}</TableCell>
                                        <TableCell className="text-slate-500 text-xs font-mono">{cat.id.slice(0, 8)}...</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300"><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductCategoriesPage;