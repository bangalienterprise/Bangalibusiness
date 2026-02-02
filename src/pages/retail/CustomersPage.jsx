
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, User, Phone, MapPin, Loader2 } from 'lucide-react';

const CustomersPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', email: ''
    });

    useEffect(() => {
        if (business?.id) {
            fetchCustomers();
        }
    }, [business]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCustomers(data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load customers" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from('customers').insert({
                business_id: business.id,
                ...formData,
                current_due: 0
            });
            if (error) throw error;
            
            toast({ title: "Customer added" });
            setIsDialogOpen(false);
            setFormData({ name: '', phone: '', address: '', email: '' });
            fetchCustomers();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to add customer" });
        } finally {
            setSaving(false);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.phone && c.phone.includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Customers - Bangali Enterprise</title></Helmet>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Customers</h1>
                    <p className="text-slate-400">Manage customer profiles.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <Search className="h-5 w-5 text-slate-400" />
                <Input 
                    placeholder="Search by name or phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-slate-500"
                />
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Phone</TableHead>
                            <TableHead className="text-slate-400">Address</TableHead>
                            <TableHead className="text-right text-slate-400">Current Due</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No customers found</TableCell></TableRow>
                        ) : (
                            filteredCustomers.map(customer => (
                                <TableRow key={customer.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-medium text-white flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        {customer.name}
                                    </TableCell>
                                    <TableCell className="text-slate-300">{customer.phone || '-'}</TableCell>
                                    <TableCell className="text-slate-300 max-w-[200px] truncate">{customer.address || '-'}</TableCell>
                                    <TableCell className={`text-right font-medium ${customer.current_due > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        ৳{customer.current_due}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Add Customer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                         <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-slate-700 text-white">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {saving ? 'Saving...' : 'Save Customer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomersPage;
