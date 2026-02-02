
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const UsersPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*, businesses(name)');
        setUsers(data || []);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">System Users</h1>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Business</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={u.id}>
                                <TableCell>{u.full_name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.businesses?.name || 'None'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default UsersPage;
