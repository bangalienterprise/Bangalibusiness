
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeletons';

const CategoryChips = ({ categories = [], selectedCategory, onSelectCategory, isLoading }) => {
    if (isLoading) {
        return <div className="flex gap-2 mb-4"><Skeleton className="h-7 w-20" /><Skeleton className="h-7 w-24" /></div>;
    }

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
                variant={selectedCategory === 'all' ? "default" : "outline"} 
                className="cursor-pointer h-7 px-3 bg-blue-600 hover:bg-blue-500 border-transparent"
                onClick={() => onSelectCategory('all')}
            >
                All Products
            </Badge>
            {categories.map(c => (
                <Badge 
                    key={c.id} 
                    variant={selectedCategory === c.id ? "secondary" : "outline"}
                    className={`cursor-pointer h-7 px-3 hover:bg-slate-800 ${selectedCategory === c.id ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-400 border-slate-700'}`}
                    onClick={() => onSelectCategory(c.id)}
                >
                    {c.name} <span className="ml-1 opacity-50 text-[10px]">({c.product_count || 0})</span>
                </Badge>
            ))}
        </div>
    );
};

export default CategoryChips;
