import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Users, Search, Trash2, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { ROLES } from '@/lib/rolePermissions';
import InviteCodeCard from '@/components/InviteCodeCard';
import InviteCodeGenerator from '@/components/InviteCodeGenerator';

const TeamManagementPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [members, setMembers] = useState([]);
    const [activeCodes, setActiveCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.business_id) return;
        setLoading(true);
        try {
            const [teamData, codesData] = await Promise.all([
                mockDatabase.getTeamMembers(user.business_id),
                mockDatabase.getInviteCodes(user.business_id)
            ]);
            setMembers(teamData);
            setActiveCodes(codesData.filter(c => c.status !== 'revoked')); // Show active and expired
        } catch (error) {
            console.error("Failed to load team data", error);
            toast({ variant: "destructive", title: "Error loading data" });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await mockDatabase.updateUser(memberId, { business_id: null, role: null, business_type: null });
            setMembers(members.filter(m => m.id !== memberId));
            toast({ title: "Member Removed", description: "User has been removed from the team." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to remove member." });
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await mockDatabase.updateUser(memberId, { role: newRole });
            setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
            toast({ title: "Role Updated", description: "Member permissions have been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update role." });
        }
    };

    const filteredMembers = members.filter(m => 
        m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Helmet><title>Team Management - Bangali Enterprise</title></Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Team Management</h1>
                    <p className="text-slate-400">Manage access and invitations for your business.</p>
                </div>
            </div>

            {/* Invite Codes Section */}
            {user?.role === ROLES.OWNER && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" /> Active Invites
                        </h2>
                        <InviteCodeGenerator onCodeGenerated={(newCode) => setActiveCodes([...activeCodes, newCode])} />
                    </div>
                    
                    {activeCodes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeCodes.map(code => (
                                <InviteCodeCard key={code.id} codeData={code} onRevoke={() => loadData()} />
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-slate-900 border-dashed border-slate-800 text-center py-8">
                            <CardContent className="text-slate-500">
                                No active invite codes. Generate one to start growing your team.
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Team List Section */}
            <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>Team Directory ({members.length})</CardTitle>
                            <CardDescription className="text-slate-400">View and manage current team members.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search members..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-700 hover:bg-slate-800/50">
                                <TableHead className="text-slate-400">Member</TableHead>
                                <TableHead className="text-slate-400">Role</TableHead>
                                <TableHead className="text-slate-400">Joined</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                {user?.role === ROLES.OWNER && <TableHead className="text-right text-slate-400">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">Loading...</TableCell>
                                </TableRow>
                            ) : filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">No team members found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow key={member.id} className="border-slate-700 hover:bg-slate-700/50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-white">{member.full_name}</div>
                                                <div className="text-xs text-slate-400">{member.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user?.role === ROLES.OWNER && member.id !== user.id ? (
                                                <Select defaultValue={member.role} onValueChange={(val) => handleRoleChange(member.id, val)}>
                                                    <SelectTrigger className="w-[110px] h-8 bg-slate-900 border-slate-700 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-slate-700">
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="staff">Staff</SelectItem>
                                                        <SelectItem value="seller">Seller</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                                                    {member.role}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-slate-500" />
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                <span className="text-sm text-slate-300">Active</span>
                                            </div>
                                        </TableCell>
                                        {user?.role === ROLES.OWNER && (
                                            <TableCell className="text-right">
                                                {member.id !== user.id && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)} className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default TeamManagementPage;