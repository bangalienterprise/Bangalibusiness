
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Download, Search, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

const ITEMS_PER_PAGE = 15;

const DamageHistory = ({ refreshTrigger }) => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [damageRecords, setDamageRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReason, setFilterReason] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchDamageHistory = async () => {
            if (!business?.id) return;
            setLoading(true);
            try {
                // Query damage_items joined with the main damages record and products
                const { data, error } = await supabase
                    .from('damage_items')
                    .select(`
                        *,
                        damage:damages(id, note, created_at, profiles(full_name, email)),
                        product:products(name, category_id)
                    `)
                    .eq('damage.business_id', business.id) // This might require a filtered join or subquery depending on RLS
                    .order('created_at', { ascending: false });

                // If the join above fails due to nested filters in some supabase versions, 
                // we'll query damages first and then items, but let's try the direct join first.
                // NOTE: Using a flat query might be safer:
                const { data: items, error: itemsError } = await supabase
                    .from('damage_items')
                    .select('*, product:products(name)')
                    .order('created_at', { ascending: false });
                
                // For a more robust solution in a multi-tenant app, we'd query by damage_id
                // But since we want "everything working", let's get damages for this business
                const { data: mainDamages, error: mainError } = await supabase
                    .from('damages')
                    .select('id, note, created_at, user_id, profiles(full_name)')
                    .eq('business_id', business.id);

                if (mainError) throw mainError;

                const damageIds = mainDamages.map(d => d.id);
                const { data: allItems, error: allItemsError } = await supabase
                    .from('damage_items')
                    .select('*, product:products(name)')
                    .in('damage_id', damageIds);

                if (allItemsError) throw allItemsError;

                // Merge data
                const merged = allItems.map(item => {
                    const parent = mainDamages.find(d => d.id === item.damage_id);
                    return {
                        ...item,
                        parent_note: parent?.note,
                        recorded_by: parent?.profiles?.full_name || 'System',
                        damage_date: parent?.created_at || item.created_at
                    };
                });

                setDamageRecords(merged || []);
            } catch (error) {
                console.error("Damage history error:", error);
                toast({ title: "Error fetching damage history", description: error.message, variant: "destructive" });
                setDamageRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDamageHistory();
    }, [business, toast, refreshTrigger]);

    const uniqueReasons = useMemo(() => {
        const reasons = new Set(damageRecords.map(r => r.reason).filter(Boolean));
        return ['All', ...Array.from(reasons)];
    }, [damageRecords]);

    const filteredRecords = useMemo(() => {
        return damageRecords.filter(record => {
            const matchesSearch = (record.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (record.recorded_by || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesReason = filterReason === 'All' || record.reason === filterReason;
            return matchesSearch && matchesReason;
        });
    }, [damageRecords, searchTerm, filterReason]);

    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredRecords, currentPage]);

    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

    const handleExport = () => {
        const csvData = filteredRecords.map(r => ({
            'Date': format(new Date(r.damage_date), 'yyyy-MM-dd'),
            'Product': r.product?.name || r.product_name,
            'Quantity': r.quantity,
            'Reason': r.reason,
            'Loss Amount': r.loss_amount,
            'Recorded By': r.recorded_by,
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `damage_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export Successful" });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by product or user..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                </div>
                <Select value={filterReason} onValueChange={(value) => { setFilterReason(value); setCurrentPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Filter by reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {uniqueReasons.map(reason => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport} disabled={filteredRecords.length === 0} className="border-slate-700 text-slate-200">
                    <Download className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
                <Table>
                    <TableHeader className="bg-slate-800/50">
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Product</TableHead>
                            <TableHead className="text-slate-400">Quantity</TableHead>
                            <TableHead className="text-slate-400">Reason</TableHead>
                            <TableHead className="text-slate-400">Recorded By</TableHead>
                            <TableHead className="text-right text-slate-400">Loss Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-500" /></TableCell></TableRow>
                        ) : paginatedRecords.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-500">No records found.</TableCell></TableRow>
                        ) : (
                            paginatedRecords.map(record => (
                                <TableRow key={record.id} className="border-slate-800 hover:bg-slate-800/30">
                                    <TableCell className="text-slate-400 text-sm">{format(new Date(record.damage_date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="font-medium text-white">{record.product?.name || record.product_name}</TableCell>
                                    <TableCell className="text-slate-300">{record.quantity}</TableCell>
                                    <TableCell className="text-slate-300">{record.reason}</TableCell>
                                    <TableCell className="text-slate-400 text-sm">{record.recorded_by}</TableCell>
                                    <TableCell className="text-right font-mono text-red-400">৳{Number(record.loss_amount).toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pb-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-slate-700 text-slate-300">
                        Previous
                    </Button>
                    <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-slate-700 text-slate-300">
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DamageHistory;
