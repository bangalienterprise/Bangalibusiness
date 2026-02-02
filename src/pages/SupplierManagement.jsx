import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Phone, Mail, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/useApi';
import { ApiService } from '@/services/ApiService';
import SuspenseLoader from '@/components/SuspenseLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const SupplierManagement = () => {
  const { data: suppliers, loading, execute: reload } = useApi(() => ApiService.get('suppliers'), [], { immediate: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });
  const { toast } = useToast();

  const handleCreate = async () => {
      if(!newSupplier.name) return;
      const res = await ApiService.post('suppliers', newSupplier);
      if(res.success) {
          toast({ title: "Supplier Added", description: `${newSupplier.name} added successfully.` });
          setIsDialogOpen(false);
          setNewSupplier({ name: '', contact_person: '', phone: '', email: '', address: '' });
          reload();
      }
  };

  const filtered = suppliers?.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  if (loading && !suppliers) return <SuspenseLoader />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <Helmet><title>Suppliers - Bangali Enterprise</title></Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Truck className="h-8 w-8 text-blue-500" /> Suppliers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Supplier</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2"><Label>Company Name</Label><Input value={newSupplier.name} onChange={e=>setNewSupplier({...newSupplier, name: e.target.value})} /></div>
                    <div className="grid gap-2"><Label>Contact Person</Label><Input value={newSupplier.contact_person} onChange={e=>setNewSupplier({...newSupplier, contact_person: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Phone</Label><Input value={newSupplier.phone} onChange={e=>setNewSupplier({...newSupplier, phone: e.target.value})} /></div>
                        <div className="grid gap-2"><Label>Email</Label><Input value={newSupplier.email} onChange={e=>setNewSupplier({...newSupplier, email: e.target.value})} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Address</Label><Input value={newSupplier.address} onChange={e=>setNewSupplier({...newSupplier, address: e.target.value})} /></div>
                </div>
                <DialogFooter><Button onClick={handleCreate}>Save Supplier</Button></DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input placeholder="Search suppliers..." className="pl-10 bg-card max-w-md" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(supplier => (
            <Card key={supplier.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{supplier.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Truck className="h-3 w-3" /> {supplier.contact_person}</p>
                        </div>
                        <Badge variant={supplier.balance < 0 ? "destructive" : "outline"}>
                            {supplier.balance < 0 ? `Due: ${Math.abs(supplier.balance)}` : 'Clear'}
                        </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-slate-400" /> {supplier.phone}</div>
                        <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-slate-400" /> {supplier.email}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-slate-400" /> {supplier.address}</div>
                    </div>
                    
                    <div className="pt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full">View History</Button>
                        <Button size="sm" className="w-full">Pay Bill</Button>
                    </div>
                </CardContent>
            </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-10">No suppliers found.</div>}
      </div>
    </div>
  );
};

export default SupplierManagement;