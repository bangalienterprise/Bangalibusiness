import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import * as db from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { User, CheckCircle2 } from 'lucide-react';

const CollectPaymentDialog = ({ open, onOpenChange, customer, onSuccess }) => {
    const { toast } = useToast();
    const { user: profile } = useAuth();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount('');
            setMethod('cash');
        }
    }, [open]);

    const handleCollect = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
            return;
        }
        if (parseFloat(amount) > customer.current_due) {
            toast({ title: "Excess Amount", description: "Collection cannot exceed current due.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Using a specialized endpoint for bulk collection logic
            await db.database.create('/sales/collect-bulk', {
                customer_id: customer.id,
                amount: parseFloat(amount),
                method: method,
                collected_by: profile.id,
                date: format(new Date(), 'yyyy-MM-dd')
            });

            toast({ title: "Payment Collected", description: `Successfully collected ৳${amount}` });
            onSuccess();
            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!customer) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Collect Payment</DialogTitle>
                </DialogHeader>
                
                <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Customer</span>
                        <span className="text-xs font-bold text-destructive uppercase">Due: ৳{customer.current_due.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold">{customer.name}</span>
                    </div>
                </div>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Collection Amount (৳)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                            <Input 
                                type="number" 
                                className="pl-8 text-lg font-bold h-12" 
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCollect} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Payment
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CollectPaymentDialog;