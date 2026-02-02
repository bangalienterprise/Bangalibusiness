import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/services/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

const DueCollectionPage = () => {
  const { activeBusiness } = useBusiness();
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [activeBusiness]);

  const fetchCustomers = async () => {
    if (!activeBusiness?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .gt('current_due', 0) // Only fetch customers with dues
        .order('current_due', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      // toast({ variant: "destructive", title: "Failed to fetch due list" });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }

    if (amount > selectedCustomer.current_due) {
      toast({ variant: "destructive", title: "Overpayment", description: "You cannot collect more than the due amount." });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Collection Record
      const { error: collectionError } = await supabase
        .from('collections')
        .insert({
          business_id: activeBusiness.id,
          customer_id: selectedCustomer.id,
          amount_paid: amount,
          payment_method: paymentMethod,
          collected_by: user.id,
          created_at: new Date().toISOString()
        });

      if (collectionError) throw collectionError;

      // 2. Update Customer Due
      const newDue = selectedCustomer.current_due - amount;
      const { error: customerError } = await supabase
        .from('customers')
        .update({ current_due: newDue })
        .eq('id', selectedCustomer.id);

      if (customerError) throw customerError;

      toast({ title: "Payment Collected", description: `Successfully collected ৳${amount} from ${selectedCustomer.name}` });
      setDialogOpen(false);
      setPaymentAmount('');
      fetchCustomers(); // Refresh list

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Transaction Failed", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const totalDue = customers.reduce((sum, c) => sum + (c.current_due || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      <Helmet>
        <title>Due Collection | Retail Store</title>
        <meta name="description" content="Manage customer dues and collections" />
      </Helmet>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Due Collection</h1>
          <p className="text-slate-400 mt-1">Track and collect outstanding payments</p>
        </div>
        <Card className="bg-slate-900 border-slate-800 w-full md:w-auto min-w-[200px]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Outstanding</p>
              <p className="text-xl font-bold text-white">৳{totalDue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Customers with Dues</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
              <Input
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-700 focus:border-slate-600"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950">
                <TableRow className="border-slate-800 hover:bg-slate-950">
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Contact</TableHead>
                  <TableHead className="text-slate-400 text-right">Last Payment</TableHead>
                  <TableHead className="text-slate-400 text-right">Current Due</TableHead>
                  <TableHead className="text-right text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No customers with due amount found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">{customer.phone || '-'}</TableCell>
                      <TableCell className="text-right text-slate-400">
                        {/* Requires last payment info, placeholder for now */}
                        -
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-red-400">
                        ৳{customer.current_due?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setPaymentAmount('');
                            setDialogOpen(true);
                          }}
                        >
                          Collect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription className="text-slate-400">
              Receive payment from <b>{selectedCustomer?.name}</b>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCollectPayment} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Due</Label>
              <div className="font-mono text-xl font-bold text-red-400">
                ৳{selectedCustomer?.current_due?.toLocaleString()}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Collection Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="bg-slate-950 border-slate-700 font-mono text-lg"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-slate-950 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Collection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DueCollectionPage;