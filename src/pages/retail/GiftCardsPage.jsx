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
import { Gift, Plus, Search, Trash2, Loader2, Copy } from 'lucide-react';
import { format } from 'date-fns';

const GiftCardsPage = () => {
    const { business } = useAuth();
    const { toast } = useToast();
    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ code: '', amount: '', expiration: '' });

    useEffect(() => {
        if (business?.id) fetchGiftCards();
    }, [business]);

    const fetchGiftCards = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gift_cards')
                .select('*')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setGiftCards(data || []);
        } catch (error) {
            console.error("Fetch error:", error);
            // Silent fail if table doesn't exist yet
        } finally {
            setLoading(false);
        }
    };

    const generateCode = () => {
        const code = 'GC-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        setFormData(prev => ({ ...prev, code }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from('gift_cards').insert({
                business_id: business.id,
                code: formData.code,
                initial_balance: formData.amount,
                current_balance: formData.amount,
                expiration_date: formData.expiration || null,
                status: 'active'
            });

            if (error) throw error;
            toast({ title: "Gift Card Created", description: `Code: ${formData.code}` });
            setIsDialogOpen(false);
            setFormData({ code: '', amount: '', expiration: '' });
            fetchGiftCards();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to create gift card" });
        } finally {
            setSaving(false);
        }
    };

    const deleteCard = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await supabase.from('gift_cards').delete().eq('id', id);
            fetchGiftCards();
            toast({ title: "Deleted" });
        } catch (error) {
             toast({ variant: "destructive", title: "Failed to delete" });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Helmet><title>Gift Cards - Bangali Enterprise</title></Helmet>
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gift Cards</h1>
                    <p className="text-slate-400">Manage vouchers and store credits.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Issue New Card
                </Button>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Code</TableHead>
                            <TableHead className="text-slate-400">Balance</TableHead>
                            <TableHead className="text-slate-400">Expires</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : giftCards.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No gift cards found</TableCell></TableRow>
                        ) : (
                            giftCards.map(card => (
                                <TableRow key={card.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-mono text-white flex items-center gap-2">
                                        {card.code}
                                        <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-500" onClick={() => { navigator.clipboard.writeText(card.code); toast({title:"Copied"}); }}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-green-400 font-bold">৳{card.current_balance}</TableCell>
                                    <TableCell className="text-slate-300">
                                        {card.expiration_date ? format(new Date(card.expiration_date), 'MMM d, yyyy') : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${card.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {card.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => deleteCard(card.id)} className="text-slate-500 hover:text-red-400">
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
                    <DialogHeader><DialogTitle>Issue Gift Card</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Card Code</Label>
                            <div className="flex gap-2">
                                <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="bg-slate-900 border-slate-700 font-mono" />
                                <Button type="button" variant="outline" onClick={generateCode}>Generate</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (৳)</Label>
                            <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiration Date (Optional)</Label>
                            <Input type="date" value={formData.expiration} onChange={e => setFormData({...formData, expiration: e.target.value})} className="bg-slate-900 border-slate-700 dark:[color-scheme:dark]" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                                {saving ? 'Creating...' : 'Create Card'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GiftCardsPage;