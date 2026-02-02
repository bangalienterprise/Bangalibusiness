import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const StockViewDialog = ({ open, onOpenChange, stockEntry }) => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            if (!stockEntry || !activeBusiness) return;
            setLoading(true);
            try {
                // Assuming an endpoint exists for getting items of a stock entry
                const data = await db.database.get(`/stock-history/${stockEntry.id}/items`);
                setItems(data || []);
            } catch (error) {
                console.error("Error fetching stock items:", error);
                // Fallback to items if they were already embedded in the entry
                if (stockEntry.items) {
                    setItems(stockEntry.items);
                } else {
                    toast({ title: "Error", description: "Failed to load details.", variant: "destructive" });
                }
            } finally {
                setLoading(false);
            }
        };

        if (open) fetchItems();
    }, [open, stockEntry, activeBusiness, toast]);

    if (!stockEntry) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Stock Entry Details</DialogTitle>
                    <DialogDescription>
                        Entry on {format(new Date(stockEntry.entry_date), 'PPP')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-4 py-2">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold">৳{Number(stockEntry.total_cost).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <Badge variant="outline" className="capitalize">{stockEntry.type || 'Purchase'}</Badge>
                    </div>
                </div>

                <ScrollArea className="h-[400px] border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Unit Cost</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading items...</TableCell></TableRow>
                            ) : items.length > 0 ? (
                                items.map((item, index) => (
                                    <TableRow key={item.id || index}>
                                        <TableCell className="font-medium">{item.product_name || item.products?.name || 'Unknown Product'}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">৳{Number(item.cost_price).toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-mono">৳{Number(item.total_cost || (item.quantity * item.cost_price)).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">No items found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default StockViewDialog;