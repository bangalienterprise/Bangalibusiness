import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { format } from 'date-fns';
import { Loader2, User, Calendar, CreditCard, FileText } from 'lucide-react';

const SaleDetailsDialog = ({ open, onOpenChange, sale }) => {
    const { customers } = useBusiness();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && sale) {
            fetchSaleItems();
        }
    }, [open, sale]);

    const fetchSaleItems = async () => {
        setLoading(true);
        try {
            // Assuming endpoint /sale-items exists
            const data = await db.database.get(`/sales/${sale.id}/items`);
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!sale) return null;

    const customer = customers.find(c => c.id === sale.customer_id);
    const due = sale.final_amount - sale.amount_paid;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Sale Details</span>
                        <Badge variant="outline" className="font-mono">#{sale.id.slice(0, 8)}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                <p className="font-semibold">{customer?.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                <p className="font-semibold">{format(new Date(sale.sale_date), 'PPP')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Info</p>
                                <p className="font-semibold capitalize">{sale.payment_method.replace('_', ' ')}</p>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant={due <= 0 ? "default" : "destructive"}>
                                        {due <= 0 ? "Paid" : "Due"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {sale.notes && (
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm italic">{sale.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="py-4">
                    <h3 className="font-semibold mb-3">Purchased Items</h3>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.products?.name || 'Unknown Product'}</div>
                                                <div className="text-xs text-muted-foreground">{item.products?.category}</div>
                                            </TableCell>
                                            <TableCell className="text-right">৳{item.unit_price}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right font-medium">৳{item.unit_price * item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 pt-2">
                    <div className="flex justify-between w-full md:w-1/2 text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>৳{sale.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-full md:w-1/2 text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span>-৳{sale.discount_amount?.toLocaleString() || 0}</span>
                    </div>
                    <Separator className="my-2 w-full md:w-1/2" />
                    <div className="flex justify-between w-full md:w-1/2 font-bold text-lg">
                        <span>Grand Total</span>
                        <span>৳{sale.final_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-full md:w-1/2 text-sm text-green-600 font-medium">
                        <span>Paid Amount</span>
                        <span>৳{sale.amount_paid.toLocaleString()}</span>
                    </div>
                    {due > 0 && (
                        <div className="flex justify-between w-full md:w-1/2 text-sm text-red-600 font-bold">
                            <span>Due Amount</span>
                            <span>৳{due.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SaleDetailsDialog;