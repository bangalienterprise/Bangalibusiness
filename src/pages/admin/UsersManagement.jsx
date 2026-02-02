
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, businesses(name)')
        .order('created_at', { ascending: false });
      
      if (!error) setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Users Management</h1>
      </div>

      <Card className="bg-[#1e293b] border-slate-700 text-white">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search users..." 
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
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Business</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
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
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-800 border-slate-700">
                      <TableCell className="font-medium text-white">{user.full_name || 'N/A'}</TableCell>
                      <TableCell className="text-slate-300">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-500 text-slate-300 capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{user.businesses?.name || 'N/A'}</TableCell>
                      <TableCell>
                         <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status || 'Active'}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                            <DropdownMenuItem className="hover:bg-slate-700">View Profile</DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-slate-700">Reset Password</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-slate-700">Block User</DropdownMenuItem>
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

export default UsersManagement;
