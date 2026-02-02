import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-medium text-white truncate text-sm" title={item.name}>{item.name}</h4>
                <p className="text-xs text-slate-500">{item.sku}</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 rounded border border-slate-800">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-slate-400 hover:text-white"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-slate-400 hover:text-white"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                
                <div className="w-20 text-right">
                    <p className="font-bold text-white text-sm">৳{(item.selling_price * item.quantity).toFixed(0)}</p>
                    <p className="text-[10px] text-slate-500">@{item.selling_price}</p>
                </div>

                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-500/70 hover:text-red-400 hover:bg-red-950/30"
                    onClick={() => onRemove(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default CartItem;