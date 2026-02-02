import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const POSCart = ({ items, onUpdateQuantity, onRemoveItem }) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0; // Simplified for now
    const total = subtotal + tax;

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-lg">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-500" /> Current Cart
                </h3>
                <span className="text-xs text-slate-400">{items.length} Items</span>
            </div>

            <ScrollArea className="flex-1">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
                        <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-900">
                                <TableHead className="text-slate-400 w-[40%]">Product</TableHead>
                                <TableHead className="text-slate-400 text-center">Qty</TableHead>
                                <TableHead className="text-slate-400 text-right">Price</TableHead>
                                <TableHead className="w-[10%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={`${item.id}-${index}`} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="font-medium text-white text-sm">
                                        <div className="truncate max-w-[120px]" title={item.name}>{item.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:bg-slate-700" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:bg-slate-700" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-white font-mono text-sm">
                                        ৳{(item.price * item.quantity).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => onRemoveItem(item.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </ScrollArea>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-lg space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                    <span>Tax (0%)</span>
                    <span>৳0</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-slate-800 pt-2">
                    <span>Total</span>
                    <span className="text-green-400">৳{total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default POSCart;