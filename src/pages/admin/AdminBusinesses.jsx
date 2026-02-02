
import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { businessService } from '@/services/businessService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { useToast } from '@/components/ui/use-toast';

const AdminBusinesses = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        setLoading(true);
        const { data, error } = await businessService.getBusinessesByUser(null, 'global_admin');
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load businesses' });
        } else {
            setBusinesses(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this business?')) {
            const { error } = await businessService.deleteBusiness(id);
            if (error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } else {
                toast({ title: 'Success', description: 'Business deleted' });
                loadBusinesses();
            }
        }
    };

    const filteredBusinesses = businesses.filter(b => 
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <AdminHeader />
            <main className="lg:ml-64 p-6 space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle className="text-white">Businesses Management</CardTitle>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input 
                                    placeholder="Search businesses..." 
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
                                            <TableHead className="text-slate-400">Name</TableHead>
                                            <TableHead className="text-slate-400">Type</TableHead>
                                            <TableHead className="text-slate-400">Owner</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400">Created</TableHead>
                                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBusinesses.map(b => (
                                            <TableRow key={b.id} className="border-slate-800 hover:bg-slate-800/50">
                                                <TableCell className="font-medium text-white">{b.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-slate-400 border-slate-700 capitalize">
                                                        {b.type || 'Retail'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    {b.profiles?.full_name || 'Unknown'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-900 text-green-300 hover:bg-green-800">Active</Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-400">
                                                    {new Date(b.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 text-red-400 hover:text-red-300"
                                                            onClick={() => handleDelete(b.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredBusinesses.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                                    No businesses found.
                                                </TableCell>
                                            </TableRow>
                                        )}
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

export default AdminBusinesses;
