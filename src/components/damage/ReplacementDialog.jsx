import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import * as db from '@/lib/database';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Package, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReplacementDialog = ({ open, onOpenChange, onSuccess }) => {
    const { activeBusiness } = useBusiness();
    const { user } = useAuth();
    const { toast } = useToast();
    const [damagedProducts, setDamagedProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDamagedProducts = async () => {
            if (!open || !activeBusiness?.id) return;
            setLoading(true);
            try {
                // Using custom endpoint for specific query
                const data = await db.database.get('/damages/pending-replacement', { params: { business_id: activeBusiness.id } });
                setDamagedProducts(data || []);
            } catch (error) {
                toast({ title: "Error fetching damaged products", description: error.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchDamagedProducts();
    }, [open, activeBusiness, toast]);

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const totalSelectedLoss = useMemo(() => {
        return selectedProducts.reduce((acc, id) => {
            const product = damagedProducts.find(p => p.id === id);
            return acc + (product ? product.loss_amount : 0);
        }, 0);
    }, [selectedProducts, damagedProducts]);

    const handleSubmit = async () => {
        if (selectedProducts.length === 0) {
            toast({ title: "No products selected", description: "Please select products to mark as replaced.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await db.database.create('/damage/process-replacement', {
                damage_ids: selectedProducts,
                business_id: activeBusiness.id,
                user_id: user.id
            });

            toast({ title: "Success!", description: `${selectedProducts.length} items have been marked as replaced and stock has been updated.` });
            setSelectedProducts([]);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Replacement Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Process Product Replacements</DialogTitle>
                    <DialogDescription>Select damaged items that have been replaced by the supplier. This will add the quantity back to your stock.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <ScrollArea className="h-72 pr-4">
                        {loading ? (
                            <p className="text-center text-muted-foreground">Loading damaged products...</p>
                        ) : damagedProducts.length > 0 ? (
                            damagedProducts.map(item => (
                                <div key={item.id} onClick={() => handleSelectProduct(item.id)}
                                    className={cn("p-3 mb-2 rounded-lg cursor-pointer transition-all flex justify-between items-center border",
                                        selectedProducts.includes(item.id) ? "bg-primary/20 border-primary" : "bg-secondary/50 hover:bg-secondary border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-muted-foreground"/>
                                        <div>
                                            <p className="font-semibold">{item.products?.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} | Loss: ৳{item.loss_amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    {selectedProducts.includes(item.id) && <Check className="h-5 w-5 text-primary"/>}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">No damaged products pending replacement.</p>
                        )}
                    </ScrollArea>
                    <div className="pt-4 border-t flex justify-between items-center font-semibold">
                        <span>Total Recovered Value:</span>
                        <span className="font-mono text-lg text-green-500">৳{totalSelectedLoss.toFixed(2)}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedProducts.length === 0}>
                        {isSubmitting ? "Processing..." : <><RotateCw className="mr-2 h-4 w-4"/> Confirm Replacements</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReplacementDialog;