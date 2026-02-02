import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import TeamMemberRow from './TeamMemberRow';

const TeamList = ({ members, loading, businessId, onUpdate }) => {
  return (
    <Card className="border-slate-700 bg-slate-800/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Members
        </CardTitle>
        <CardDescription>
            Manage access and roles for your business.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-700">
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading team...
                    </div>
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No team members found. Invite someone to get started!
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TeamMemberRow 
                    key={member.id} 
                    member={member} 
                    businessId={businessId}
                    onUpdate={onUpdate}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamList;