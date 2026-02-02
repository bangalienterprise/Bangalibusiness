
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';

const ProductTable = ({ products = [], isLoading, error, onEdit, onDelete, canDelete }) => {
    
    if (isLoading) {
        return (
            <div className="rounded-md border border-slate-800">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow><TableHead>SKU</TableHead><TableHead>Name</TableHead><TableHead>Stock</TableHead><TableHead>Cost</TableHead><TableHead>Price</TableHead><TableHead>Actions</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        <SkeletonLoader variant="table-row" count={5} />
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-red-900 bg-red-950/20 rounded">
                <AlertCircle className="h-6 w-6 text-red-500 mb-2"/>
                <p className="text-red-400">Error loading products: {error}</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return <EmptyState title="No Products Found" description="Try adjusting filters or add a new product." />;
    }

    return (
        <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-950">
                    <TableRow className="border-slate-800 hover:bg-slate-950">
                        <TableHead className="text-slate-400">SKU</TableHead>
                        <TableHead className="text-slate-400">Product</TableHead>
                        <TableHead className="text-slate-400">Stock</TableHead>
                        <TableHead className="text-slate-400">Cost</TableHead>
                        <TableHead className="text-slate-400">Price</TableHead>
                        <TableHead className="text-slate-400">Margin</TableHead>
                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                        const cost = parseFloat(product.buying_price || 0);
                        const price = parseFloat(product.selling_price || 0);
                        const stock = product.stock_quantity || product.stock_qty || 0;
                        const alertQty = product.alert_qty || product.min_stock_alert || 0;
                        
                        const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                        const isLowStock = stock <= alertQty;

                        return (
                            <TableRow key={product.id || Math.random()} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-mono text-xs text-slate-500">{product.sku || 'N/A'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{product.name || 'Unnamed Product'}</span>
                                        <span className="text-xs text-slate-500">
                                            {product.category?.name || 'Uncategorized'} • {product.unit_type || 'unit'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={isLowStock ? "destructive" : "outline"} 
                                        className={!isLowStock ? "text-green-400 border-green-900 bg-green-900/10" : ""}
                                    >
                                        {stock} {product.unit_type || ''}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400">৳{cost.toFixed(2)}</TableCell>
                                <TableCell className="text-white font-medium">৳{price.toFixed(2)}</TableCell>
                                <TableCell>
                                    {cost === 0 ? <span className="text-slate-500">N/A</span> : (
                                        <span className={margin > 30 ? "text-green-500" : margin > 15 ? "text-yellow-500" : "text-red-500"}>
                                            {margin.toFixed(1)}%
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-blue-400" onClick={() => onEdit(product)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {canDelete && (
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-400" onClick={() => onDelete(product.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductTable;
