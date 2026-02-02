
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import { calculateProfitMargin } from '@/utils/calculations';
import { PackageOpen } from 'lucide-react';

const ProductTable = ({ products, isLoading, error, onEdit, onDelete, canDelete }) => {
    
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
        return <div className="text-red-500 text-center p-8">Error loading products: {error.message}</div>;
    }

    if (!products || products.length === 0) {
        return <EmptyState icon={PackageOpen} title="No Products Found" description="Try adjusting filters or add a new product." />;
    }

    return (
        <div className="rounded-md border border-slate-800">
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
                        const margin = calculateProfitMargin(product.buying_price, product.selling_price);
                        const isLowStock = product.stock_qty <= product.min_stock_alert;

                        return (
                            <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-mono text-xs text-slate-500">{product.sku}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{product.name}</span>
                                        <span className="text-xs text-slate-500">
                                            {product.category?.name || 'Uncategorized'} • {product.unit_type}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={isLowStock ? "destructive" : "outline"} 
                                        className={!isLowStock ? "text-green-400 border-green-900 bg-green-900/10" : ""}
                                    >
                                        {product.stock_qty} {product.unit_type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400">৳{product.buying_price}</TableCell>
                                <TableCell className="text-white font-medium">৳{product.selling_price}</TableCell>
                                <TableCell>
                                    <span className={margin > 30 ? "text-green-500" : margin > 15 ? "text-yellow-500" : "text-red-500"}>
                                        {margin.toFixed(1)}%
                                    </span>
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
