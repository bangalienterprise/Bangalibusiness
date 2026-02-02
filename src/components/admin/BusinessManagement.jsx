import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { Search, MoreHorizontal, Ban, RefreshCw, Trash2, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const BusinessManagement = () => {
    const { toast } = useToast();
    const [businesses, setBusinesses] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        // Assume direct access to mock data for admin
        setBusinesses(mockDatabase.data.businesses || []);
    }, []);

    const filtered = businesses.filter(b => 
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAction = (action, id) => {
        toast({ title: `Action: ${action}`, description: `Business ID: ${id}` });
        // Implement logic in MockDatabase
    };

    return (
        <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Businesses
                </CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Search businesses..." 
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
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Type</TableHead>
                            <TableHead className="text-slate-400">Owner Email</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((biz) => (
                            <TableRow key={biz.id} className="border-slate-700 hover:bg-slate-700/50">
                                <TableCell className="font-medium text-white">{biz.name}</TableCell>
                                <TableCell className="capitalize text-slate-300">{biz.type}</TableCell>
                                <TableCell className="text-slate-400 text-sm">{biz.owner_email}</TableCell>
                                <TableCell>
                                    <Badge className={biz.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                                        {biz.status || 'Active'}
                                    </Badge>
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
                                            <DropdownMenuItem onClick={() => handleAction('suspend', biz.id)} className="hover:bg-slate-800 cursor-pointer">
                                                <Ban className="mr-2 h-4 w-4" /> Suspend
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('restore', biz.id)} className="hover:bg-slate-800 cursor-pointer">
                                                <RefreshCw className="mr-2 h-4 w-4" /> Restore
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleAction('delete', biz.id)} className="text-red-400 hover:bg-red-950/20 cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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
    );
};

export default BusinessManagement;