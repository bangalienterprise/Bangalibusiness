import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Papa from 'papaparse';
import { PlusCircle, Search, Download, Trash2, Wallet, Users, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/contexts/BusinessContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SalaryDialog from '@/components/salary/SalaryDialog';
import { format, startOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';


const SalaryManagement = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: startOfMonth(new Date()), to: new Date() });
    const [roleFilter, setRoleFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const { users, activeBusiness } = useBusiness();

    const fetchData = useCallback(async () => {
        if (!activeBusiness) return;
        setLoading(true);
        let query = supabase.from('salaries').select('*, user:profiles!salaries_user_id_fkey(full_name, username, role), recordedBy:profiles!salaries_recorded_by_fkey(username)').eq('business_id', activeBusiness.id).order('payment_date', { ascending: false });

        const { data, error } = await query;

        if (error) toast({ title: 'Error loading salaries', description: error.message, variant: 'destructive' });
        else setSalaries(data || []);
        
        setLoading(false);
    }, [activeBusiness, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (salaryId) => {
        const { error } = await supabase.from('salaries').delete().eq('id', salaryId);
        if (error) toast({ title: 'Deletion Failed', variant: 'destructive', description: error.message });
        else { toast({ title: 'Salary record deleted.' }); fetchData(); }
    };
    
    const filteredSalaries = useMemo(() => {
        return salaries.filter(s => {
            const paymentDate = new Date(s.payment_date);
            const from = dateRange.from; const to = dateRange.to;
            if (from && paymentDate < from) return false; if (to && paymentDate > to) return false;
            if (roleFilter !== 'all' && s.user?.role !== roleFilter) return false;
            if (userFilter !== 'all' && s.user_id !== userFilter) return false;
            
            const searchLower = searchTerm.toLowerCase();
            const userName = s.user?.full_name?.toLowerCase() || s.user?.username?.toLowerCase() || '';
            return userName.includes(searchLower) || (s.notes && s.notes.toLowerCase().includes(searchLower));
        });
    }, [salaries, searchTerm, dateRange, roleFilter, userFilter]);
    
    const { totalPaid, byRole } = useMemo(() => {
        const total = filteredSalaries.reduce((sum, s) => sum + Number(s.amount), 0);
        const rolesSummary = filteredSalaries.reduce((acc, s) => {
            const role = s.user?.role || 'unknown';
            acc[role] = (acc[role] || 0) + Number(s.amount);
            return acc;
        }, {});
        return { totalPaid: total, byRole: rolesSummary };
    }, [filteredSalaries]);

    const handleDownload = () => {
        const csvData = filteredSalaries.map(s => ({ Employee: s.user?.full_name || s.user?.username, Amount: s.amount, PaymentDate: s.payment_date, PaymentMethod: s.payment_method, Notes: s.notes, RecordedBy: s.recordedBy?.username }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `salaries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const roleOptions = ['all', ...new Set(users.map(u => u.role).filter(Boolean))];

    return (
        <>
            <Helmet><title>Salary Management - Bangali Enterprise</title></Helmet>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div><h1 className="text-3xl font-bold">Salary Management</h1><p className="text-muted-foreground">Track and manage all employee salary payments.</p></div>
                    <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="h-4 w-4 mr-2" />Record Payment</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Paid (Filtered)</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold text-green-500">৳{totalPaid.toLocaleString()}</p></CardContent></Card>
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Paid to Managers</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">৳{(byRole.manager || 0).toLocaleString()}</p></CardContent></Card>
                    <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Paid to Sellers</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-2xl font-bold">৳{(byRole.seller || 0).toLocaleString()}</p></CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Filters</CardTitle>
                        <CardDescription>Filter salary records by employee, role, date range, or search term.</CardDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            <Input placeholder="Search by name or notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <Select value={userFilter} onValueChange={setUserFilter}><SelectTrigger><SelectValue placeholder="All Employees" /></SelectTrigger><SelectContent><SelectItem value="all">All Employees</SelectItem>{users.map(u=><SelectItem key={u.id} value={u.id}>{u.full_name || u.username}</SelectItem>)}</SelectContent></Select>
                            <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger><SelectContent>{roleOptions.map(r=><SelectItem key={r} value={r} className="capitalize">{r.replace('_',' ')}</SelectItem>)}</SelectContent></Select>
                            <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full" />
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-semibold">Payment History</h3>
                           <Button onClick={handleDownload} variant="outline" size="sm"><Download className="h-4 w-4 mr-2"/>Export CSV</Button>
                       </div>
                       <div className="overflow-x-auto"><Table>
                           <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Amount</TableHead><TableHead>Payment Date</TableHead><TableHead>Method</TableHead><TableHead>Notes</TableHead><TableHead>Recorded By</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                           <TableBody>
                               {loading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : filteredSalaries.length > 0 ? (
                                   filteredSalaries.map(salary => (
                                       <TableRow key={salary.id}>
                                           <TableCell className="font-medium">{salary.user?.full_name || salary.user?.username}</TableCell>
                                           <TableCell>৳{Number(salary.amount).toLocaleString('en-IN')}</TableCell>
                                           <TableCell>{format(new Date(salary.payment_date), 'PPP')}</TableCell>
                                           <TableCell><Badge variant="outline">{salary.payment_method}</Badge></TableCell>
                                           <TableCell className="text-muted-foreground">{salary.notes || '–'}</TableCell>
                                           <TableCell>{salary.recordedBy?.username || 'N/A'}</TableCell>
                                           <TableCell className="text-right">
                                               <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent>
                                                   <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this record.</AlertDialogDescription></AlertDialogHeader>
                                                   <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(salary.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                               </AlertDialogContent></AlertDialog>
                                           </TableCell>
                                       </TableRow>
                                   ))
                               ) : <TableRow><TableCell colSpan={7} className="h-24 text-center">No salaries found.</TableCell></TableRow>}
                           </TableBody>
                       </Table></div>
                    </CardContent>
                </Card>
            </div>
            <SalaryDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchData} />
        </>
    );
};

export default SalaryManagement;