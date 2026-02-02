import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
    Activity, Users, Building2, Globe, ShieldAlert, BarChart3, 
    Search, Ban, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { mockDatabase } from '@/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const GlobalAdminDashboard = () => {
    const { toast } = useToast();
    const [stats, setStats] = useState({ users: 0, businesses: 0, revenue: 0 });
    const [businesses, setBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // In a real app, these would be API calls. Here we access mock DB directly.
        const allUsers = mockDatabase.users;
        const allBusinesses = mockDatabase.businesses;
        
        setStats({
            users: allUsers.length,
            businesses: allBusinesses.length,
            revenue: 125000 // Mock revenue
        });
        setBusinesses(allBusinesses);
    };

    const handleSuspendBusiness = (id) => {
        if (!confirm("Are you sure you want to suspend this business?")) return;
        // Mock update
        const updated = businesses.map(b => b.id === id ? {...b, status: 'suspended'} : b);
        setBusinesses(updated);
        toast({ title: "Business Suspended", description: "Access has been revoked." });
    };

    const handleRestoreBusiness = (id) => {
        const updated = businesses.map(b => b.id === id ? {...b, status: 'active'} : b);
        setBusinesses(updated);
        toast({ title: "Business Restored", description: "Access has been restored." });
    };

    const filteredBusinesses = businesses.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Helmet><title>Global Admin - Bangali Enterprise</title></Helmet>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Global Administration</h1>
                    <p className="text-slate-400">System overview and management.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-700 text-slate-300" asChild>
                        <Link to="/admin/cms"><Globe className="mr-2 h-4 w-4" /> Website CMS</Link>
                    </Button>
                    <Button variant="outline" className="border-slate-700 text-slate-300" asChild>
                        <Link to="/admin/users"><Users className="mr-2 h-4 w-4" /> User Management</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.users}</div></CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Businesses</CardTitle>
                        <Building2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.businesses}</div></CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">৳{stats.revenue.toLocaleString()}</div></CardContent>
                </Card>
            </div>

            {/* Business List */}
            <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>Business Registry</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search businesses..." 
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
                                <TableHead className="text-slate-400">Business Name</TableHead>
                                <TableHead className="text-slate-400">Type</TableHead>
                                <TableHead className="text-slate-400">Owner</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                                <TableHead className="text-right text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBusinesses.map((biz) => (
                                <TableRow key={biz.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell className="font-medium text-white">{biz.name}</TableCell>
                                    <TableCell className="capitalize text-slate-300">{biz.type}</TableCell>
                                    <TableCell className="text-slate-400">{biz.owner_email || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge className={biz.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                                            {biz.status || 'active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {biz.status === 'suspended' ? (
                                            <Button variant="ghost" size="sm" onClick={() => handleRestoreBusiness(biz.id)} className="text-green-400 hover:text-green-300 hover:bg-green-950/30">
                                                <RefreshCw className="h-4 w-4 mr-1" /> Restore
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => handleSuspendBusiness(biz.id)} className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                                                <Ban className="h-4 w-4 mr-1" /> Suspend
                                            </Button>
                                        )}
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

export default GlobalAdminDashboard;