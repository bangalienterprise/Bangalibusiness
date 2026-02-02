import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, MoreVertical, Edit, Trash2, Search, CreditCard, Building, ArrowRightLeft, Coins as HandCoins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const GiftCardManagement = () => {
    const { hasPermission } = useAuth();
    
    if (!hasPermission('manage_gift_cards')) {
        return <div>You do not have permission to view this page.</div>;
    }

    return (
        <>
            <Helmet>
                <title>Gift Card Management</title>
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <h1 className="text-3xl font-bold">Gift Card Management</h1>
                    <p className="text-muted-foreground">Manage gift card collections, suppliers, and distributions.</p>
                </div>
                <Tabs defaultValue="collections">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="collections"><CreditCard className="w-4 h-4 mr-2" />Collections</TabsTrigger>
                        <TabsTrigger value="suppliers"><Building className="w-4 h-4 mr-2" />Suppliers</TabsTrigger>
                        <TabsTrigger value="distributions"><ArrowRightLeft className="w-4 h-4 mr-2" />Distributions</TabsTrigger>
                        <TabsTrigger value="settlements"><HandCoins className="w-4 h-4 mr-2" />Settlements</TabsTrigger>
                    </TabsList>
                    <TabsContent value="collections" className="mt-4"><GiftCardCollections /></TabsContent>
                    <TabsContent value="suppliers" className="mt-4"><SupplierManagement /></TabsContent>
                    <TabsContent value="distributions" className="mt-4">DistributionManagement</TabsContent>
                    <TabsContent value="settlements" className="mt-4">SettlementManagement</TabsContent>
                </Tabs>
            </motion.div>
        </>
    );
};

// Placeholder components for the other tabs
const SupplierManagement = () => <Card><CardHeader><CardTitle>Suppliers</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀</p></CardContent></Card>;
const DistributionManagement = () => <Card><CardHeader><CardTitle>Distributions</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀</p></CardContent></Card>;
const SettlementManagement = () => <Card><CardHeader><CardTitle>Settlements</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀</p></CardContent></Card>;


const GiftCardCollections = () => {
    const { activeBusiness } = useBusiness();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [collections, setCollections] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const loadData = useCallback(async () => {
        if (!activeBusiness) return;
        setLoading(true);
        const [colRes, brandRes] = await Promise.all([
            supabase.from('gift_card_collections').select('*, brand:gift_card_brands(name)').eq('business_id', activeBusiness.id).order('collection_date', { ascending: false }),
            supabase.from('gift_card_brands').select('*').eq('business_id', activeBusiness.id)
        ]);
        if(colRes.error) toast({title: "Error loading collections", description: colRes.error.message, variant: 'destructive'});
        else setCollections(colRes.data);
        if(brandRes.error) toast({title: "Error loading brands", description: brandRes.error.message, variant: 'destructive'});
        else setBrands(brandRes.data);
        setLoading(false);
    }, [activeBusiness, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gift Card Collections</CardTitle>
                    <CardDescription>Gift cards collected from customers.</CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}><Plus className="mr-2 h-4 w-4"/> New Collection</Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Card Code</TableHead>
                            <TableHead>Face Value</TableHead>
                            <TableHead>Purchase Price</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> :
                        collections.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{new Date(c.collection_date).toLocaleDateString()}</TableCell>
                                <TableCell>{c.brand?.name || 'N/A'}</TableCell>
                                <TableCell className="font-mono">{c.card_code}</TableCell>
                                <TableCell>৳{c.face_value}</TableCell>
                                <TableCell>৳{c.purchase_price}</TableCell>
                                <TableCell><Badge variant={c.status === 'collected' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                            </TableRow>
                        ))
                        }
                        {!loading && collections.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24">No collections yet.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
            <CollectionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} brands={brands} onSuccess={loadData} />
        </Card>
    );
};

const CollectionDialog = ({ open, onOpenChange, brands, onSuccess }) => {
    const { activeBusiness } = useBusiness();
    const { profile } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        brand_id: '',
        card_code: '',
        face_value: '',
        purchase_rate: '',
        customer_name: '',
        collection_date: new Date().toISOString().split('T')[0]
    });

    const purchasePrice = useMemo(() => {
        const faceValue = parseFloat(formData.face_value);
        const rate = parseFloat(formData.purchase_rate);
        if(!isNaN(faceValue) && !isNaN(rate)) {
            return (faceValue * (rate / 100)).toFixed(2);
        }
        return '0.00';
    }, [formData.face_value, formData.purchase_rate]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            business_id: activeBusiness.id,
            recorded_by: profile.id,
            face_value: parseFloat(formData.face_value),
            purchase_rate: parseFloat(formData.purchase_rate),
            purchase_price: parseFloat(purchasePrice)
        };
        const { error } = await supabase.from('gift_card_collections').insert(dataToSubmit);
        if(error) {
            toast({ title: 'Error saving collection', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Collection Saved' });
            onSuccess();
            onOpenChange(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>New Gift Card Collection</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Brand</Label>
                            <Select value={formData.brand_id} onValueChange={val => setFormData(p=>({...p, brand_id: val}))}>
                                <SelectTrigger><SelectValue placeholder="Select brand"/></SelectTrigger>
                                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Card Code</Label>
                            <Input value={formData.card_code} onChange={e => setFormData(p=>({...p, card_code: e.target.value}))} required/>
                        </div>
                         <div className="space-y-2">
                            <Label>Face Value (৳)</Label>
                            <Input type="number" value={formData.face_value} onChange={e => setFormData(p=>({...p, face_value: e.target.value}))} required/>
                        </div>
                         <div className="space-y-2">
                            <Label>Purchase Rate (%)</Label>
                            <Input type="number" value={formData.purchase_rate} onChange={e => setFormData(p=>({...p, purchase_rate: e.target.value}))} required/>
                        </div>
                    </div>
                     <div className="p-2 bg-muted rounded-md text-center">
                        <Label>Calculated Purchase Price</Label>
                        <p className="font-bold text-lg">৳{purchasePrice}</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Customer Name (Optional)</Label>
                        <Input value={formData.customer_name} onChange={e => setFormData(p=>({...p, customer_name: e.target.value}))} />
                    </div>
                     <div className="space-y-2">
                        <Label>Collection Date</Label>
                        <Input type="date" value={formData.collection_date} onChange={e => setFormData(p=>({...p, collection_date: e.target.value}))} required/>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Save Collection</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default GiftCardManagement;