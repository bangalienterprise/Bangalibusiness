import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Users, Search, MoreHorizontal, UserX, UserCheck, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockDatabase } from '@/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';

const UserManagement = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setUsers(mockDatabase.users);
    }, []);

    const toggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        const updated = users.map(u => u.id === id ? {...u, status: newStatus} : u);
        setUsers(updated);
        // Mock DB Update would go here
        toast({ title: "User Updated", description: `User status changed to ${newStatus}.` });
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Helmet><title>User Management - Global Admin</title></Helmet>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
            </div>

            <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>All Users</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search users..." 
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
                                <TableHead className="text-slate-400">User</TableHead>
                                <TableHead className="text-slate-400">Role</TableHead>
                                <TableHead className="text-slate-400">Business Type</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-right text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u) => (
                                <TableRow key={u.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-white">{u.full_name}</div>
                                            <div className="text-xs text-slate-400">{u.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize text-slate-300">{u.role}</TableCell>
                                    <TableCell className="capitalize text-slate-300">{u.business_type}</TableCell>
                                    <TableCell>
                                        <Badge className={u.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                                            {u.status || 'active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white">
                                                <DropdownMenuItem onClick={() => toggleStatus(u.id, u.status || 'active')}>
                                                    {u.status === 'suspended' ? <><UserCheck className="mr-2 h-4 w-4" /> Activate</> : <><UserX className="mr-2 h-4 w-4" /> Suspend</>}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-400">
                                                    <Shield className="mr-2 h-4 w-4" /> Reset Password
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;