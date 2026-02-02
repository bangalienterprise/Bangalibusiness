import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import UserHoverCard from '@/components/users/UserHoverCard';
import CustomerHoverCard from '@/components/customers/CustomerHoverCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import SaleEditDialog from '@/components/market/SaleEditDialog';

const SalesDetailsDialog = ({ open, onOpenChange, transaction }) => {
  const { products, refreshData } = useBusiness();
  const [editOpen, setEditOpen] = useState(false);

  if (!transaction) return null;

  const due = (transaction.final_amount || 0) - (transaction.amount_paid || 0);
  const status = due <= 0 ? 'paid' : (transaction.amount_paid || 0) > 0 ? 'partial' : 'due';

  const handleEditSuccess = () => {
    refreshData();
    onOpenChange(false); // Close details dialog to refresh or re-open with new data if needed
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
                <span className="font-mono">{transaction.id}</span>
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Sale
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div>
                <h4 className="font-semibold text-sm mb-1">Customer</h4>
                {transaction.customer ? (
                    <CustomerHoverCard customer={transaction.customer}>
                        <p>{transaction.customer.name}</p>
                    </CustomerHoverCard>
                ) : <p className="text-muted-foreground">N/A</p>}
            </div>
            <div>
                <h4 className="font-semibold text-sm mb-1">Seller</h4>
                 {transaction.seller && (
                    <UserHoverCard user={transaction.seller}>
                        <div className='flex items-center gap-2'>
                           <Avatar className="h-6 w-6">
                             <AvatarImage src={transaction.seller.avatar_url} />
                             <AvatarFallback>{transaction.seller.username?.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span>{transaction.seller.full_name || transaction.seller.username}</span>
                        </div>
                    </UserHoverCard>
                )}
            </div>
             <div>
                <h4 className="font-semibold text-sm mb-1">Sale Date</h4>
                <p>{format(new Date(transaction.sale_date), 'PPP')}</p>
            </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(transaction.sale_items || []).map(item => {
                const product = products.find(p => p.id === item.product_id);
                const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">৳{(item.unit_price || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">৳{itemTotal.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
            <div className="text-muted-foreground">Subtotal</div>
            <div className="text-right font-mono">৳{(transaction.total_amount || 0).toLocaleString()}</div>

            <div className="text-muted-foreground">Discount</div>
            <div className="text-right font-mono text-destructive">- ৳{(transaction.discount_amount || 0).toLocaleString()}</div>

            <div className="font-semibold">Grand Total</div>
            <div className="text-right font-semibold font-mono">৳{(transaction.final_amount || 0).toLocaleString()}</div>

            <div className="text-muted-foreground">Amount Paid</div>
            <div className="text-right font-mono text-green-500">৳{(transaction.amount_paid || 0).toLocaleString()}</div>

            <div className="font-semibold">Amount Due</div>
            <div className="text-right font-semibold font-mono text-orange-500">৳{due.toLocaleString()}</div>

            <div className="text-muted-foreground">Payment Status</div>
            <div className="text-right">
                <Badge variant={status === 'paid' ? 'secondary' : status === 'partial' ? 'outline' : 'destructive'} className={cn('capitalize', status === 'paid' && 'bg-green-500/20 text-green-400 border-green-500/30', status === 'partial' && 'text-amber-400 border-amber-500/30' )}>
                    {status}
                </Badge>
            </div>
        </div>

      </DialogContent>
    </Dialog>
    <SaleEditDialog open={editOpen} onOpenChange={setEditOpen} sale={transaction} onSuccess={handleEditSuccess} />
    </>
  );
};

export default SalesDetailsDialog;