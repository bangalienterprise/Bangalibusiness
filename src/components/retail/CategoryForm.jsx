
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoryService } from '@/services/categoryService';
import { validateCategory } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';
import { Loader2 } from 'lucide-react';

const CategoryForm = ({ isOpen, onClose, mode = 'create', category, businessId, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && category) {
                setName(category.name || '');
                setDescription(category.description || '');
            } else {
                setName('');
                setDescription('');
            }
            setErrors([]);
        }
    }, [isOpen, mode, category]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!businessId) {
            showErrorToast("No business selected");
            return;
        }

        const categoryData = { name, description };
        const { isValid, errors: validationErrors } = validateCategory(categoryData);
        
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            let result;

            if (mode === 'create') {
                result = await categoryService.createCategory(businessId, categoryData);
            } else {
                if (!category?.id) throw new Error("Category ID missing for edit");
                result = await categoryService.updateCategory(businessId, category.id, categoryData);
            }

            if (result.error) throw new Error(result.error);

            showSuccessToast(`Category ${mode === 'create' ? 'created' : 'updated'} successfully`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            showErrorToast(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!businessId && isOpen) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <div className="p-4 text-center text-red-400">Error: No active business found. Please select a business.</div>
                    <Button onClick={onClose}>Close</Button>
                </DialogContent>
            </Dialog>
        );
    }
    
    if (mode === 'edit' && !category && isOpen) {
         return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <div className="p-4 text-center text-red-400">Error: Category data not found.</div>
                    <Button onClick={onClose}>Close</Button>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add New Category' : 'Edit Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Category Name <span className="text-red-500">*</span></Label>
                        <Input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="bg-slate-950 border-slate-700" 
                            placeholder="e.g. Beverages"
                            disabled={loading}
                        />
                        {errors.map((err, i) => (
                            <p key={i} className="text-red-500 text-xs">{err}</p>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="bg-slate-950 border-slate-700" 
                            placeholder="Optional description..."
                            disabled={loading}
                            maxLength={200}
                        />
                        <p className="text-xs text-slate-500 text-right">{description.length}/200</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Create' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryForm;
