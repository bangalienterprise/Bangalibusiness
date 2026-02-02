
import React from 'react';
import { Badge } from '@/components/ui/badge';

const CategoryChips = ({ categories = [], selectedCategory, onSelectCategory }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
                variant={selectedCategory === 'all' ? "default" : "outline"} 
                className="cursor-pointer h-7 px-3"
                onClick={() => onSelectCategory('all')}
            >
                All Products
            </Badge>
            {categories.map(c => (
                <Badge 
                    key={c.id} 
                    variant={selectedCategory === c.id ? "default" : "outline"}
                    className="cursor-pointer border-slate-700 hover:bg-slate-800 h-7 px-3"
                    onClick={() => onSelectCategory(c.id)}
                >
                    {c.name} <span className="ml-1 opacity-50 text-[10px]">({c.product_count || 0})</span>
                </Badge>
            ))}
        </div>
    );
};

export default CategoryChips;
