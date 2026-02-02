import React, { useState, useEffect, useMemo } from 'react';
import * as db from '@/lib/database';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const ReplacementHistory = ({ refreshTrigger }) => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [replacementRecords, setReplacementRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReplacementHistory = async () => {
            if (!activeBusiness?.id) return;
            setLoading(true);
            try {
                // Custom endpoint for replacement history
                const data = await db.database.get('/damages/replaced', { params: { business_id: activeBusiness.id } });
                setReplacementRecords(data || []);
            } catch (error) {
                toast({ title: "Error fetching replacement history", description: error.message, variant: "destructive" });
                setReplacementRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReplacementHistory();
    }, [activeBusiness, toast, refreshTrigger]);

    const filteredRecords = useMemo(() => {
        return replacementRecords.filter(record => 
            record.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.profiles?.full_name || record.profiles?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [replacementRecords, searchTerm]);


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Replacement History</h2>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by product or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 max-w-sm"
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Replacement Date</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Processed By</TableHead>
                            <TableHead className="text-right">Recovered Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Loading history...</TableCell></TableRow>
                        ) : filteredRecords.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center">No replacement records found.</TableCell></TableRow>
                        ) : (
                            filteredRecords.map(record => (
                                <TableRow key={record.id}>
                                    <TableCell>{format(new Date(record.replacement_date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="font-medium">{record.products?.name}</TableCell>
                                    <TableCell>{record.quantity}</TableCell>
                                    <TableCell>{record.profiles?.full_name || record.profiles?.username || 'N/A'}</TableCell>
                                    <TableCell className="text-right font-mono text-green-500">৳{record.loss_amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ReplacementHistory;