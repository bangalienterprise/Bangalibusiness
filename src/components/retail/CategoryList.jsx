
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';
import { categoryService } from '@/services/categoryService';

const CategoryList = ({ categories = [], isLoading, error, onEdit, onSuccess, canDelete, businessId }) => {
    
    const handleDelete = async (categoryId) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        
        try {
            const { error } = await categoryService.deleteCategory(businessId, categoryId);
            if (error) throw new Error(error);
            showSuccessToast("Category deleted successfully");
            if (onSuccess) onSuccess();
        } catch (err) {
            showErrorToast(err.message);
        }
    };

    if (isLoading) return <SkeletonLoader variant="list" count={6} />;
    
    if (error) return (
        <div className="flex flex-col items-center justify-center p-8 border border-red-900 bg-red-950/20 rounded-lg">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-400 font-medium">{error}</p>
            <Button variant="outline" className="mt-4 border-red-800 text-red-400 hover:bg-red-950/50" onClick={onSuccess}>Retry</Button>
        </div>
    );

    if (!categories || categories.length === 0) {
        return <EmptyState title="No Categories Found" description="Create your first category to organize products." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
                <Card key={cat.id || Math.random()} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-colors">
                    <div className="overflow-hidden mr-2">
                        <h4 className="font-medium text-white truncate" title={cat.name}>{cat.name || 'Untitled'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-400 shrink-0">
                                {cat.product_count || 0} Products
                            </Badge>
                            {cat.description && (
                                <span className="text-xs text-slate-500 truncate max-w-[150px]" title={cat.description}>
                                    {cat.description}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-blue-400" onClick={() => onEdit(cat)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-400" onClick={() => handleDelete(cat.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default CategoryList;
