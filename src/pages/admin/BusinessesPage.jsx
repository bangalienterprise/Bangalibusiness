
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const BusinessesPage = () => {
    const [businesses, setBusinesses] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const { data } = await supabase.from('businesses').select('*');
        setBusinesses(data || []);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Manage Businesses</h1>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {businesses.map(b => (
                            <TableRow key={b.id}>
                                <TableCell className="font-medium">{b.name}</TableCell>
                                <TableCell>{b.type}</TableCell>
                                <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">Manage Users</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default BusinessesPage;
