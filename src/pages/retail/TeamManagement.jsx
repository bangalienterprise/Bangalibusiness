import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { Users, Shield, Plus, Mail } from 'lucide-react';
import CommissionManagement from './CommissionManagement';

const TeamManagement = () => {
    const { user } = useAuth();
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    
    // Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'seller' });

    useEffect(() => {
        const loadTeam = async () => {
            if (activeBusiness?.id) {
                try {
                    const members = await mockDatabase.getTeamMembers(activeBusiness.id);
                    setTeam(members || []);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadTeam();
    }, [activeBusiness]);

    const handleInvite = async () => {
        if(!newUser.email || !newUser.name) return;
        
        try {
            // Mock invite process
            const createdUser = await mockDatabase.createUser({
                full_name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                business_id: activeBusiness.id,
                business_type: 'retail',
                password: 'password123' // Temp password
            });
            
            setTeam(prev => [...prev, createdUser]);
            setInviteOpen(false);
            setNewUser({ name: '', email: '', role: 'seller' });
            toast({ title: "Team member added", description: "Default password is 'password123'" });
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <Helmet><title>Team Management</title></Helmet>
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Team Management</h1>
                    <p className="text-slate-400">Manage your staff, permissions, and commissions.</p>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4"/> Add Member</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader><DialogTitle>Add New Team Member</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="bg-slate-950 border-slate-700"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="bg-slate-950 border-slate-700"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                                    <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800">
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="seller">Seller</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
                            <Button onClick={handleInvite} className="bg-blue-600">Add Member</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800">
                    <TabsTrigger value="members">Team Members</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="commissions">Commissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="members" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-400"/> Staff List</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead>Member</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {team.map(member => (
                                        <TableRow key={member.id} className="border-slate-800">
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{member.full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{member.full_name}</span>
                                                    <span className="text-xs text-slate-500">{member.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{member.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-purple-400"/> Access Control</CardTitle><CardDescription>Manage detailed permissions for managers.</CardDescription></CardHeader>
                        <CardContent>
                            <div className="text-center text-slate-500 py-8">Permission management coming soon. Only Owners have full access by default.</div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="commissions">
                    <CommissionManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TeamManagement;