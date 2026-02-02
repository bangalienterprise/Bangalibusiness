
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
import { Truck, Plus, Phone, Mail, MapPin, Trash2, Loader2 } from 'lucide-react';

const SuppliersPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });

    useEffect(() => {
        if (business?.id) fetchSuppliers();
    }, [business]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setSuppliers(data || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from('suppliers').insert({
                business_id: business.id,
                ...formData
            });

            if (error) throw error;
            toast({ title: "Supplier Added", description: formData.name });
            setIsDialogOpen(false);
            setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
            fetchSuppliers();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to add supplier" });
        } finally {
            setSaving(false);
        }
    };

    const deleteSupplier = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await supabase.from('suppliers').delete().eq('id', id);
            fetchSuppliers();
            toast({ title: "Supplier removed" });
        } catch (error) {
             toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Suppliers - Bangali Enterprise</title></Helmet>
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Suppliers</h1>
                    <p className="text-slate-400">Manage vendor relationships.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Company Name</TableHead>
                            <TableHead className="text-slate-400">Contact Person</TableHead>
                            <TableHead className="text-slate-400">Phone</TableHead>
                            <TableHead className="text-slate-400">Address</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : suppliers.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No suppliers found</TableCell></TableRow>
                        ) : (
                            suppliers.map(supplier => (
                                <TableRow key={supplier.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-medium text-white">
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-slate-500" />
                                            {supplier.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">{supplier.contact_person || '-'}</TableCell>
                                    <TableCell className="text-slate-300">{supplier.phone || '-'}</TableCell>
                                    <TableCell className="text-slate-300 max-w-[200px] truncate">{supplier.address || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => deleteSupplier(supplier.id)} className="text-slate-500 hover:text-red-400">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <Input value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-slate-900 border-slate-700" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                {saving ? 'Saving...' : 'Save Supplier'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SuppliersPage;
