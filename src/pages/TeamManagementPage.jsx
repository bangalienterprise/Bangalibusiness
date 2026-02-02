import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import InviteCodeGenerator from '@/components/team/InviteCodeGenerator';
import { Badge } from '@/components/ui/badge';

const TeamManagementPage = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        if (user) {
            setMembers(mockDatabase.getTeamMembers(user.business_id));
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Team Management</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.full_name}</TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                                            <TableCell><span className="text-green-500 text-sm">Active</span></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <InviteCodeGenerator />
                </div>
            </div>
        </div>
    );
};

export default TeamManagementPage;