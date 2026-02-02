import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Undo2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useAuth } from '@/contexts/AuthContext';

const ReturnsPage = () => {
    const { user } = useAuth();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock load
        setLoading(false);
    }, []);

    return (
        <div className="space-y-6">
            <Helmet><title>Returns Management</title></Helmet>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Returns</h1>
                    <p className="text-slate-400">Process and track product returns.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500">
                    <Plus className="mr-2 h-4 w-4" /> New Return
                </Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Undo2 className="h-5 w-5" /> Recent Returns
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                        <Input 
                            placeholder="Search returns..." 
                            className="pl-8 bg-slate-950 border-slate-700 text-white"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-900">
                                <TableHead className="text-slate-400">Return ID</TableHead>
                                <TableHead className="text-slate-400">Date</TableHead>
                                <TableHead className="text-slate-400">Product</TableHead>
                                <TableHead className="text-slate-400">Reason</TableHead>
                                <TableHead className="text-slate-400 text-right">Amount</TableHead>
                                <TableHead className="text-slate-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                                    No returns found.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReturnsPage;