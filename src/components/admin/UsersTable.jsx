import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { Search, MoreHorizontal, Shield, Trash2, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const UsersTable = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setUsers(mockDatabase.data.users || []);
    }, []);

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm("Delete user?")) {
            toast({ title: "User Deleted", description: "This action is simulated." });
        }
    }

    return (
        <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> System Users
                </CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8 bg-slate-900 border-slate-600 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800/50">
                            <TableHead className="text-slate-400">User</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Business Type</TableHead>
                            <TableHead className="text-slate-400">Created At</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{user.full_name || 'No Name'}</span>
                                        <span className="text-xs text-slate-400">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize text-sm text-slate-300">{user.business_type || 'N/A'}</span>
                                </TableCell>
                                <TableCell className="text-sm text-slate-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-white">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer"><Shield className="mr-2 h-4 w-4" /> Change Role</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-400 hover:bg-red-950/20 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete User</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default UsersTable;