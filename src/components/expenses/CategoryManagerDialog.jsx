import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import * as db from '@/lib/database';
import { useBusiness } from '@/contexts/BusinessContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CategoryManagerDialog = ({ open, onOpenChange, onSuccess, expenseType }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { activeBusiness } = useBusiness();

  const loadCategories = useCallback(async () => {
    if (!activeBusiness || !expenseType) return;
    setLoading(true);
    try {
      // Assuming db provides an endpoint for categories
      const data = await db.database.get('/expenses/categories', { 
          params: { 
              business_id: activeBusiness.id, 
              type: expenseType 
          } 
      });
      setCategories(data);
    } catch (error) {
      toast({ title: 'Error loading categories', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [activeBusiness, toast, expenseType]);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: 'Category name cannot be empty.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await db.database.create('/expenses/categories', {
        name: newCategoryName.trim(),
        business_id: activeBusiness.id,
        expense_type: expenseType
      });
      
      toast({ title: 'Category added.' });
      setNewCategoryName('');
      onSuccess();
      loadCategories();
    } catch (error) {
      toast({ title: 'Error adding category', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await db.database.remove('/expenses/categories', id);
      toast({ title: 'Category deleted.' });
      onSuccess();
      loadCategories();
    } catch (error) {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategoryName.trim()) {
      toast({ title: 'Category name cannot be empty.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await db.database.update('/expenses/categories', editingCategoryId, { name: editingCategoryName.trim() });
      toast({ title: 'Category updated.' });
      setEditingCategoryId(null);
      setEditingCategoryName('');
      onSuccess();
      loadCategories();
    } catch (error) {
      toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphic">
        <DialogHeader>
          <DialogTitle>Manage {expenseType === 'business' ? 'Business' : 'Owner'} Expense Categories</DialogTitle>
          <DialogDescription>Add, edit, or delete categories for your expenses.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-background/50"
              disabled={loading}
            />
            <Button onClick={handleAddCategory} disabled={loading}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                {editingCategoryId === cat.id ? (
                  <>
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="flex-1 bg-background"
                      disabled={loading}
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveEdit} disabled={loading}>
                      <Save className="h-4 w-4 text-green-400" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingCategoryId(null)} disabled={loading}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="flex-1">{cat.name}</p>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} disabled={loading}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" disabled={loading || (cat.expenses && cat.expenses.length > 0)} className="text-destructive hover:text-destructive disabled:text-muted-foreground/50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete the "{cat.name}" category. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-destructive hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagerDialog;