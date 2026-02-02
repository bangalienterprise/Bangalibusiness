import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus, Save } from 'lucide-react';

const CategoryDialog = ({ open, onOpenChange, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = () => {
    const stored = JSON.parse(localStorage.getItem('expenseCategories') || '[]');
    setCategories(stored);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: 'Category name cannot be empty.', variant: 'destructive' });
      return;
    }
    const newCategory = {
      id: Date.now(),
      name: newCategoryName.trim(),
    };
    const updatedCategories = [...categories, newCategory];
    localStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    setNewCategoryName('');
    toast({ title: 'Category added.' });
    onSuccess();
  };

  const handleDeleteCategory = (id) => {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    if(expenses.some(e => e.categoryId === id)) {
        toast({ title: 'Cannot delete category', description: 'This category is being used by existing expenses.', variant: 'destructive' });
        return;
    }
    const updatedCategories = categories.filter(c => c.id !== id);
    localStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    toast({ title: 'Category deleted.' });
    onSuccess();
  };

  const handleStartEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = () => {
    const updatedCategories = categories.map(c => 
      c.id === editingCategoryId ? { ...c, name: editingCategoryName.trim() } : c
    );
    localStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    setEditingCategoryId(null);
    setEditingCategoryName('');
    toast({ title: 'Category updated.' });
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphic">
        <DialogHeader>
          <DialogTitle>Manage Expense Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-background/50"
            />
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                {editingCategoryId === cat.id ? (
                  <Input
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="flex-1 bg-background"
                  />
                ) : (
                  <p className="flex-1">{cat.name}</p>
                )}
                <div className="flex gap-1">
                  {editingCategoryId === cat.id ? (
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 text-green-400" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleStartEdit(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(cat.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;