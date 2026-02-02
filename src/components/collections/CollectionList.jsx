import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, FileDown } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { deleteCollection } from '@/lib/database';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EditCollectionDialog from './EditCollectionDialog';
import Papa from 'papaparse';

const CollectionList = ({ collections, dateRange }) => {
    const { user: profile, hasPermission } = useAuth();
    const { refreshData } = useBusiness();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCollection, setEditingCollection] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const filteredCollections = useMemo(() => {
        return collections.filter(c => {
            // Date Filter
            if (dateRange?.from && dateRange?.to) {
                const date = parseISO(c.collection_date);
                if (!isWithinInterval(date, { start: dateRange.from, end: dateRange.to })) return false;
            }

            // Search Filter
            const searchLower = searchTerm.toLowerCase();
            const customerName = c.sale?.customer?.name?.toLowerCase() || '';
            const collectedBy = c.collected_by_user?.full_name?.toLowerCase() || '';
            const notes = c.notes?.toLowerCase() || '';

            return customerName.includes(searchLower) || collectedBy.includes(searchLower) || notes.includes(searchLower);
        }).sort((a, b) => new Date(b.collection_date) - new Date(a.collection_date));
    }, [collections, searchTerm, dateRange]);

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteCollection(deletingId);
            toast({ title: "Deleted", description: "Collection record deleted successfully." });
            refreshData();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = () => {
        const data = filteredCollections.map(c => ({
            Date: c.collection_date,
            Customer: c.sale?.customer?.name || 'N/A',
            Amount: c.amount_collected,
            Method: c.payment_method,
            'Collected By': c.collected_by_user?.full_name || 'N/A',
            Notes: c.notes || ''
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `collections_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
    };

    const canEdit = hasPermission('manage_sales') || profile?.role === 'owner' || profile?.role === 'admin';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Search by customer, collector, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Collected By</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCollections.length > 0 ? (
                            filteredCollections.map((collection) => (
                                <TableRow key={collection.id}>
                                    <TableCell>{format(parseISO(collection.collection_date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="font-medium">{collection.sale?.customer?.name || 'Unknown'}</TableCell>
                                    <TableCell className="font-mono">৳{Number(collection.amount_collected).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{collection.payment_method.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{collection.collected_by_user?.full_name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{collection.notes}</TableCell>
                                    <TableCell className="text-right">
                                        {canEdit && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreBangali Enterprisetal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingCollection(collection)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeletingId(collection.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No collections found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingCollection && (
                <EditCollectionDialog
                    collection={editingCollection}
                    isOpen={!!editingCollection}
                    onClose={() => setEditingCollection(null)}
                />
            )}

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this collection record and revert the amount paid on the associated sale. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CollectionList;