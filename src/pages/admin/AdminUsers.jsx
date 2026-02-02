
import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { userService } from '@/services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2 } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { useToast } from '@/components/ui/use-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const { data, error } = await userService.getAllUsers();
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load users' });
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u => 
        (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
        (u.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <AdminHeader />
            <main className="lg:ml-64 p-6 space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle className="text-white">User Management</CardTitle>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input 
                                    placeholder="Search users..." 
                                    className="pl-8 bg-slate-950 border-slate-700" 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? <SkeletonLoader variant="table-row" count={5} /> : (
                            <div className="rounded-md border border-slate-800">
                                <Table>
                                    <TableHeader className="bg-slate-950">
                                        <TableRow className="border-slate-800">
                                            <TableHead className="text-slate-400">User Details</TableHead>
                                            <TableHead className="text-slate-400">Role</TableHead>
                                            <TableHead className="text-slate-400">Business</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map(u => (
                                            <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/50">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-white">{u.full_name}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                                        {u.role || 'user'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    {u.businesses?.name || 'None'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-blue-900 text-blue-300 hover:bg-blue-800">Active</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AdminUsers;
