import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useBusiness } from '@/contexts/BusinessContext';
import * as db from '@/lib/database';
import { Label } from '@/components/ui/label';
import UserHoverCard from '@/components/users/UserHoverCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import SellerSelector from '@/components/customers/SellerSelector';

const roleBadgeStyle = {
  owner: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/30',
  admin: 'bg-red-400/20 text-red-400 border-red-400/30 hover:bg-red-400/30',
  manager: 'bg-blue-400/20 text-blue-400 border-blue-400/30 hover:bg-blue-400/30',
  seller: 'bg-green-400/20 text-green-400 border-green-400/30 hover:bg-green-400/30',
};

const CustomerDetailsDialog = ({ open, onOpenChange, customer, onEdit, onDelete, onSuccess }) => {
    const { hasPermission } = useAuth();
    const { toast } = useToast();
    const { sellers, sales, products } = useBusiness();

    const [isSaving, setIsSaving] = useState(false);
    
    const canManage = hasPermission('manage_customers');

    const { customerSales, totalSpent, totalDue } = useMemo(() => {
        if (!customer || !sales) return { customerSales: [], totalSpent: 0, totalDue: 0 };
        const customerTransactions = sales.filter(s => s.customer_id === customer.id);
        
        const spent = customerTransactions.reduce((sum, s) => sum + s.amount_paid, 0);
        const total = customerTransactions.reduce((sum, s) => sum + s.final_amount, 0);

        return { customerSales: customerTransactions, totalSpent: spent, totalDue: total - spent };
    }, [customer, sales]);
    
    const allSellers = sellers || [];
    const assignedSeller = useMemo(() => allSellers.find(s => s.id === customer?.assigned_seller_id), [customer, allSellers]);

    const handleDelete = async () => {
        onDelete(customer);
    };
    
    const handleSellerChange = async (newSellerId) => {
        setIsSaving(true);
        try {
            await db.updateCustomer(customer.id, { 
                assigned_seller_id: newSellerId === 'unassigned' || newSellerId === null ? null : newSellerId 
            });
            toast({ title: "Seller Updated", description: "Customer has been reassigned." });
            onSuccess();
        } catch (error) {
            toast({ title: "Failed to update seller", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (!customer) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Customer Details</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="md:col-span-1 space-y-6">
                        <div className="p-4 border rounded-lg bg-card flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4"><AvatarFallback className="text-3xl">{customer.name.charAt(0)}</AvatarFallback></Avatar>
                            <h3 className="font-bold text-xl">{customer.name}</h3>
                            <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4" /> {customer.email || 'No email'}</p>
                                <p className="flex items-center justify-center gap-2"><Phone className="h-4 w-4" /> {customer.phone || 'No phone'}</p>
                                <p className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" /> {customer.address || 'No address'}</p>
                            </div>
                        </div>

                         <div className="p-4 border rounded-lg bg-card">
                            <h4 className="font-semibold mb-3 text-foreground text-center">Assigned Seller</h4>
                            {canManage ? (
                                <div className='space-y-2'>
                                  <Label htmlFor='seller-select'>Change Seller</Label>
                                  <SellerSelector
                                      value={customer.assigned_seller_id}
                                      onChange={handleSellerChange}
                                      disabled={isSaving}
                                  />
                                </div>
                            ) : (
                                assignedSeller ? (
                                    <UserHoverCard user={assignedSeller}>
                                        <div className="flex items-center gap-4 cursor-pointer">
                                            <Avatar className="h-12 w-12"><AvatarImage src={assignedSeller.avatar_url} /><AvatarFallback>{assignedSeller.username?.charAt(0)}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-bold">{assignedSeller.full_name || assignedSeller.username}</p>
                                                <Badge className={cn("capitalize text-xs", roleBadgeStyle[assignedSeller.role])}>{assignedSeller.role}</Badge>
                                            </div>
                                        </div>
                                    </UserHoverCard>
                                ) : <p className='text-muted-foreground text-center text-sm'>Unassigned</p>
                            )}
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-card grid grid-cols-3 gap-2 text-center">
                           <div><p className="text-xs text-muted-foreground">Purchases</p><p className="font-bold text-lg">{customerSales.length}</p></div>
                           <div><p className="text-xs text-muted-foreground">Total Spent</p><p className="font-bold text-lg font-mono">৳{totalSpent.toLocaleString()}</p></div>
                           <div><p className="text-xs text-muted-foreground text-destructive">Total Due</p><p className="font-bold text-lg font-mono text-destructive">৳{totalDue.toLocaleString()}</p></div>
                        </div>

                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-3 text-foreground">Purchase History</h4>
                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                           {customerSales.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-secondary/50 sticky top-0"><tr className="text-sm"><th className="p-3 text-left">Items</th><th className="p-3 text-center">Date</th><th className="p-3 text-right">Amount</th></tr></thead>
                                <tbody>
                                    {customerSales.map(sale => {
                                        const saleProducts = sale.sale_items?.map(item => {
                                            const product = products.find(p => p.id === item.product_id);
                                            return product ? `${product.name} x ${item.quantity}` : `Unknown Product x ${item.quantity}`;
                                        }).join(', ');

                                        return (
                                            <tr key={sale.id} className="border-b last:border-b-0 hover:bg-secondary/30">
                                                <td className="p-3 font-medium text-foreground text-xs">{saleProducts || 'N/A'}</td>
                                                <td className="p-3 text-center text-muted-foreground">{format(new Date(sale.sale_date), 'dd MMM yyyy')}</td>
                                                <td className="p-3 text-right font-mono font-semibold text-foreground">৳{sale.final_amount.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                           ) : (
                            <div className="p-8 text-center text-muted-foreground">No purchase history found.</div>
                           )}
                        </div>
                    </div>
                </div>
                {canManage && (
                <DialogFooter className="mt-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive-outline"><Trash2 className="h-4 w-4 mr-2" /> Request Deletion</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Request Deletion?</AlertDialogTitle><AlertDialogDescription>This will create a request for an admin to approve the deletion of '{customer.name}'.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Request Deletion</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => onEdit(customer)}><Edit className="h-4 w-4 mr-2" /> Edit Customer</Button>
                </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CustomerDetailsDialog;