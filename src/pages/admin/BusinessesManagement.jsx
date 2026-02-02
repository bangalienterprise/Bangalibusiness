
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BusinessesManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, profiles:owner_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (!error) setBusinesses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Businesses Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Create Business
        </Button>
      </div>

      <Card className="bg-[#1e293b] border-slate-700 text-white">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search business or owner..."
              className="pl-8 bg-slate-900 border-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-700">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="hover:bg-slate-900 border-slate-700">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Owner</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Created</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                    </TableCell>
                  </TableRow>
                ) : filteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No businesses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses.map((biz) => (
                    <TableRow key={biz.id} className="hover:bg-slate-800 border-slate-700">
                      <TableCell className="font-medium text-white">{biz.name}</TableCell>
                      <TableCell className="text-slate-300">{biz.type}</TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex flex-col">
                          <span>{biz.profiles?.full_name || 'N/A'}</span>
                          <span className="text-xs text-slate-500">{biz.profiles?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={biz.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                          {biz.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{new Date(biz.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                            <DropdownMenuItem className="hover:bg-slate-700">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700">Edit Business</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-slate-700">Suspend</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessesManagement;
