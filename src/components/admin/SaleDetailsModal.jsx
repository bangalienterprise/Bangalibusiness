import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

const SaleDetailsModal = ({ sale, open, onOpenChange }) => {
    if (!sale) return null;

    const profit = (sale.sale_items || []).reduce((acc, item) => {
        const costPrice = item.products?.buying_price || 0;
        return acc + (item.unit_price - costPrice) * item.quantity;
    }, 0);

    const downloadReceipt = () => {
        let receipt = `Sale Receipt\n`;
        receipt += `--------------------------------\n`;
        receipt += `Sale ID: ${sale.id}\n`;
        receipt += `Date: ${format(new Date(sale.sale_date), 'PPP p')}\n`;
        receipt += `Seller: ${sale.seller?.username || 'N/A'}\n`;
        receipt += `Customer: ${sale.customer?.name || 'N/A'}\n`;
        receipt += `--------------------------------\n\n`;
        receipt += `Items:\n`;

        (sale.sale_items || []).forEach(item => {
            const productName = item.products?.name || 'Unknown Product';
            receipt += `${productName} - ${item.quantity} x ৳${item.unit_price} = ৳${item.quantity * item.unit_price}\n`;
        });

        receipt += `\n--------------------------------\n`;
        receipt += `Subtotal: ৳${sale.total_amount}\n`;
        receipt += `Discount: ৳${sale.discount_amount || 0}\n`;
        receipt += `Total: ৳${sale.final_amount}\n`;
        receipt += `Paid: ৳${sale.amount_paid}\n`;
        receipt += `Due: ৳${sale.final_amount - sale.amount_paid}\n`;
        receipt += `--------------------------------\n`;

        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-sale-${sale.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Sale Details</DialogTitle>
                    <DialogDescription>
                        Details for Sale ID: {sale.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    <div><strong>Seller:</strong> {sale.seller?.username || 'N/A'}</div>
                    <div><strong>Customer:</strong> {sale.customer?.name || 'N/A'}</div>
                    <div><strong>Date:</strong> {format(new Date(sale.sale_date), 'PPP p')}</div>
                    <div className="font-semibold text-green-600"><strong>Calculated Profit:</strong> ৳{profit.toLocaleString()}</div>
                </div>

                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Buying Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(sale.sale_items || []).map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.products?.name || 'Unknown'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>৳{item.unit_price.toLocaleString()}</TableCell>
                                    <TableCell>৳{(item.products?.buying_price || 0).toLocaleString()}</TableCell>
                                    <TableCell>৳{(item.quantity * item.unit_price).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-right">
                    <div>Subtotal:</div><div>৳{sale.total_amount.toLocaleString()}</div>
                    <div>Discount:</div><div className="text-destructive">- ৳{(sale.discount_amount || 0).toLocaleString()}</div>
                    <div className="font-bold">Total:</div><div className="font-bold">৳{sale.final_amount.toLocaleString()}</div>
                    <div>Amount Paid:</div><div>৳{sale.amount_paid.toLocaleString()}</div>
                    <div className="font-bold text-orange-600">Due:</div><div className="font-bold text-orange-600">৳{(sale.final_amount - sale.amount_paid).toLocaleString()}</div>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <Button onClick={downloadReceipt}>
                        <Download className="mr-2 h-4 w-4" /> Download Receipt
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

SaleDetailsModal.propTypes = {
    sale: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
};

export default SaleDetailsModal;