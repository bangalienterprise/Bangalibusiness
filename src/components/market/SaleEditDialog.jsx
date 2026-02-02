import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const SaleEditDialog = ({ open, onOpenChange, sale, onSuccess }) => {
    const { customers } = useBusiness();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        customer_id: '',
        sale_date: '',
        amount_paid: '',
        payment_method: '',
        notes: ''
    });

    useEffect(() => {
        if (sale) {
            setFormData({
                customer_id: sale.customer_id,
                sale_date: sale.sale_date,
                amount_paid: sale.amount_paid,
                payment_method: sale.payment_method,
                notes: sale.notes || ''
            });
        }
    }, [sale]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await db.updateSale(sale.id, {
                customer_id: formData.customer_id,
                sale_date: formData.sale_date,
                amount_paid: parseFloat(formData.amount_paid),
                payment_method: formData.payment_method,
                notes: formData.notes
            });

            toast({
                title: "Sale Updated",
                description: "The sale details have been successfully updated.",
            });
            onSuccess();
        } catch (error) {
            console.error('Error updating sale:', error);
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Sale Details</DialogTitle>
                    <DialogDescription>
                        Correct any wrong inputs. Note: Changing amounts here updates the record but does not automatically refund/charge payments externally.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Select 
                            value={formData.customer_id} 
                            onValueChange={(val) => setFormData({...formData, customer_id: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Sale Date</Label>
                            <Input 
                                id="date" 
                                type="date" 
                                value={formData.sale_date}
                                onChange={(e) => setFormData({...formData, sale_date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Payment Method</Label>
                            <Select 
                                value={formData.payment_method} 
                                onValueChange={(val) => setFormData({...formData, payment_method: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount Paid (Total: ৳{sale.final_amount})</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            step="0.01"
                            value={formData.amount_paid}
                            onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">
                            Adjust this if the recorded payment was incorrect.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea 
                            id="notes" 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Reason for correction..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SaleEditDialog;