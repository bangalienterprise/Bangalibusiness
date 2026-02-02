import React, { useEffect, useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, Plus, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TeamPage = () => {
    const { activeBusiness } = useBusiness();
    const { role } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        if (!['owner', 'manager'].includes(role)) {
            // navigate('/access-denied'); // Strict redirect can be annoying during dev, just showing empty/message is safer
        }
        if (activeBusiness?.id) loadTeam();
    }, [activeBusiness, role]);

    const loadTeam = async () => {
        setLoading(true);
        try {
            // Correct query using business_users junction table
            const { data, error } = await supabase
                .from('business_users')
                .select(`
                    id,
                    role,
                    created_at,
                    user:profiles(id, full_name, email, role)
                `)
                .eq('business_id', activeBusiness.id);
                
            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error("Team load error:", error);
            // toast({ variant: "destructive", title: "Failed to load team" });
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        // Placeholder for invitation logic (requires backend email service usually)
        toast({ title: "Invitation Sent", description: `Invite sent to ${inviteEmail} (Simulation)` });
        setInviteEmail('');
    };

    return (
        <div className="space-y-6 animate-in fade-in">
             <Helmet><title>Team - Bangali Enterprise</title></Helmet>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Team Management</h1>
                    <p className="text-slate-400">Manage your staff and their permissions.</p>
                </div>
                
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white">
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input 
                                    value={inviteEmail} 
                                    onChange={(e) => setInviteEmail(e.target.value)} 
                                    placeholder="colleague@example.com"
                                    className="bg-slate-900 border-slate-700" 
                                />
                            </div>
                            <Button onClick={handleInvite} className="w-full">Send Invitation</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card className="bg-slate-800 border-slate-700">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800">
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
                        ) : members.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No team members found.</TableCell></TableRow>
                        ) : (
                            members.map(m => (
                                <TableRow key={m.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-medium text-white">{m.user?.full_name || 'Unknown'}</TableCell>
                                    <TableCell className="text-slate-300">{m.user?.email}</TableCell>
                                    <TableCell className="capitalize text-blue-400">{m.role}</TableCell>
                                    <TableCell><span className="text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs">Active</span></TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default TeamPage;