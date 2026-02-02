
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error) setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading audit logs..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
      <Card className="bg-[#1e293b] border-slate-700 text-white">
        <CardHeader>
            <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader className="bg-slate-900">
                    <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">User</TableHead>
                        <TableHead className="text-slate-400">Action</TableHead>
                        <TableHead className="text-slate-400">Entity</TableHead>
                        <TableHead className="text-slate-400">IP Address</TableHead>
                        <TableHead className="text-slate-400">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                         <TableRow><TableCell colSpan={5} className="text-center text-slate-500">No logs found.</TableCell></TableRow>
                    ) : (
                        logs.map(log => (
                            <TableRow key={log.id} className="border-slate-700 hover:bg-slate-800">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{log.profiles?.full_name || 'System'}</span>
                                        <span className="text-xs text-slate-500">{log.profiles?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline" className="border-blue-500 text-blue-400">{log.action}</Badge></TableCell>
                                <TableCell className="text-slate-300">{log.entity_type} <span className="text-xs text-slate-500">({log.entity_id})</span></TableCell>
                                <TableCell className="text-slate-300">{log.ip_address || 'N/A'}</TableCell>
                                <TableCell className="text-slate-300">{new Date(log.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
