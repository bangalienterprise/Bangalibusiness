
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const SalesHistoryPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Detail Modal State
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleItems, setSaleItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (business?.id) {
            fetchSales();
        }
    }, [business]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sales_transactions')
                .select(`
                    *,
                    customer:customers(name),
                    seller:profiles!sales_transactions_sold_by_fkey(full_name)
                `)
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setSales(data);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed to load sales history" });
        } finally {
            setLoading(false);
        }
    };

    const fetchSaleDetails = async (sale) => {
        setSelectedSale(sale);
        setIsDetailOpen(true);
        setLoadingItems(true);
        try {
            const { data, error } = await supabase
                .from('sales_items')
                .select('*, product:products(name)')
                .eq('sale_id', sale.id);
            
            if (error) throw error;
            setSaleItems(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load sale details" });
        } finally {
            setLoadingItems(false);
        }
    };

    const filteredSales = sales.filter(s => 
        (s.customer?.name && s.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (total, paid) => {
        if (paid >= total) return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20">Paid</Badge>;
        if (paid > 0) return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/20">Partial</Badge>;
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20">Unpaid</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Sales History - Bangali Enterprise</title></Helmet>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sales History</h1>
                    <p className="text-slate-400">View and manage past transactions.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search by ID or Customer..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-800 border-slate-700 text-white w-full md:w-[300px]"
                    />
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Invoice ID</TableHead>
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Customer</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Sold By</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : filteredSales.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No sales found</TableCell></TableRow>
                        ) : (
                            filteredSales.map(sale => (
                                <TableRow key={sale.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-mono text-xs text-slate-400">#{sale.id.slice(0, 8)}</TableCell>
                                    <TableCell className="text-slate-300 text-sm">
                                        {format(new Date(sale.created_at), 'MMM d, h:mm a')}
                                    </TableCell>
                                    <TableCell className="text-white font-medium">{sale.customer?.name || 'Walk-in Customer'}</TableCell>
                                    <TableCell className="text-slate-200">৳{sale.total_amount}</TableCell>
                                    <TableCell>{getStatusBadge(sale.total_amount, sale.paid_amount)}</TableCell>
                                    <TableCell className="text-slate-400 text-sm">{sale.seller?.full_name || 'System'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => fetchSaleDetails(sale)} className="text-blue-400 hover:bg-blue-900/20">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" /> Invoice Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedSale && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <div>
                                    <span className="text-slate-500 block">Invoice ID</span>
                                    <span className="font-mono text-white">#{selectedSale.id}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Date</span>
                                    <span className="text-white">{format(new Date(selectedSale.created_at), 'PPP p')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Customer</span>
                                    <span className="text-white font-medium">{selectedSale.customer?.name || 'Walk-in'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Status</span>
                                    <span>{getStatusBadge(selectedSale.total_amount, selectedSale.paid_amount)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium text-slate-300">Items</h3>
                                <div className="border border-slate-700 rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-800">
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-slate-400">Product</TableHead>
                                                <TableHead className="text-right text-slate-400">Qty</TableHead>
                                                <TableHead className="text-right text-slate-400">Price</TableHead>
                                                <TableHead className="text-right text-slate-400">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingItems ? (
                                                <TableRow><TableCell colSpan={4} className="text-center py-4 text-slate-500">Loading items...</TableCell></TableRow>
                                            ) : (
                                                saleItems.map(item => (
                                                    <TableRow key={item.id} className="border-slate-800">
                                                        <TableCell className="text-slate-300">{item.product?.name}</TableCell>
                                                        <TableCell className="text-right text-slate-300">{item.qty}</TableCell>
                                                        <TableCell className="text-right text-slate-300">৳{item.price}</TableCell>
                                                        <TableCell className="text-right text-slate-200 font-medium">৳{item.price * item.qty}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 text-sm border-t border-slate-800 pt-4">
                                <div className="flex justify-between w-48 text-slate-400">
                                    <span>Total Amount:</span>
                                    <span className="text-white font-medium">৳{selectedSale.total_amount}</span>
                                </div>
                                <div className="flex justify-between w-48 text-slate-400">
                                    <span>Paid:</span>
                                    <span className="text-green-400 font-medium">৳{selectedSale.paid_amount}</span>
                                </div>
                                <div className="flex justify-between w-48 text-slate-400">
                                    <span>Due:</span>
                                    <span className="text-red-400 font-medium">৳{selectedSale.due_amount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SalesHistoryPage;
