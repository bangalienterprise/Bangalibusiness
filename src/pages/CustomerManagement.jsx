import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Trash2, Edit, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import SuspenseLoader from '@/components/SuspenseLoader';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

const CustomerManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [user]);

  const loadCustomers = async () => {
      if (!user?.business_id) return;
      setLoading(true);
      try {
          // Assuming we added 'customers' to mockDB, but we'll use a specific call if available or generic getAll
          // Since MockDatabase doesn't have explicit getCustomers, we use getAll with collection name
          const data = await mockDatabase.getAll('customers', user.business_id);
          setCustomers(data);
      } catch (error) {
          console.error("Failed to load customers", error);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id) => {
      if (!confirm("Are you sure?")) return;
      try {
          await mockDatabase.delete('customers', id);
          toast({ title: "Deleted", description: "Customer removed." });
          loadCustomers();
      } catch (err) {
          toast({ variant: "destructive", title: "Error", description: err.message });
      }
  };

  const filteredCustomers = useMemo(() => {
      return customers.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          c.phone?.includes(searchTerm)
      );
  }, [customers, searchTerm]);

  if (loading) return <SuspenseLoader />;

  return (
    <div className="space-y-6">
      <Helmet><title>Customers - Bangali Enterprise</title></Helmet>
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Customer Management</h1>
            <p className="text-slate-400">Track customer details and purchase history.</p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-500">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
                placeholder="Search by name or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
      </div>

      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400">Contact</TableHead>
                        <TableHead className="text-slate-400">Location</TableHead>
                        <TableHead className="text-right text-slate-400">Total Purchases</TableHead>
                        <TableHead className="text-right text-slate-400">Total Due</TableHead>
                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCustomers.map(customer => (
                        <TableRow key={customer.id} className="border-slate-700 hover:bg-slate-700/50">
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>
                                <div className="flex flex-col text-xs space-y-1">
                                    <span className="flex items-center gap-1 text-slate-300"><Phone className="h-3 w-3" /> {customer.phone}</span>
                                    {customer.email && <span className="flex items-center gap-1 text-slate-400"><Mail className="h-3 w-3" /> {customer.email}</span>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {customer.city || customer.address || 'N/A'}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">{customer.total_purchases || 0}</TableCell>
                            <TableCell className="text-right font-mono text-red-400">{customer.total_due > 0 ? `৳${customer.total_due}` : '-'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingCustomer(customer); setIsDialogOpen(true); }}>
                                    <Edit className="h-4 w-4 text-blue-400" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                     {filteredCustomers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">No customers found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <CustomerFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        customer={editingCustomer} 
        onSuccess={loadCustomers} 
      />
    </div>
  );
};

const CustomerFormDialog = ({ open, onOpenChange, customer, onSuccess }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (customer) {
            setValue('name', customer.name);
            setValue('phone', customer.phone);
            setValue('email', customer.email);
            setValue('address', customer.address);
            setValue('city', customer.city);
        } else {
            reset();
        }
    }, [customer, open, reset, setValue]);

    const onSubmit = async (data) => {
        try {
            const customerData = { ...data, business_id: user.business_id };
            if (customer) {
                await mockDatabase.update('customers', customer.id, customerData);
                toast({ title: "Updated", description: "Customer details updated." });
            } else {
                await mockDatabase.create('customers', { ...customerData, total_purchases: 0, total_due: 0 });
                toast({ title: "Created", description: "New customer added." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input {...register('name', { required: true })} className="bg-slate-950 border-slate-700" />
                        {errors.name && <span className="text-red-500 text-xs">Required</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone *</Label>
                            <Input {...register('phone', { required: true })} className="bg-slate-950 border-slate-700" />
                            {errors.phone && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input {...register('email')} className="bg-slate-950 border-slate-700" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input {...register('address')} className="bg-slate-950 border-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input {...register('city')} className="bg-slate-950 border-slate-700" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Save Customer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerManagement;