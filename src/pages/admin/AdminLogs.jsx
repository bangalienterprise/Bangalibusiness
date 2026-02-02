
import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminService } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SkeletonLoader from '@/components/common/SkeletonLoader';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const { logs: data } = await adminService.getAuditLogs(20);
            setLogs(data || []);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <AdminHeader />
            <main className="ml-64 p-6 space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-white">Audit Logs</CardTitle></CardHeader>
                    <CardContent>
                        {loading ? <SkeletonLoader variant="table-row" count={10} /> : (
                            <Table>
                                <TableHeader className="bg-slate-950">
                                    <TableRow>
                                        <TableHead className="text-slate-400">Action</TableHead>
                                        <TableHead className="text-slate-400">Resource</TableHead>
                                        <TableHead className="text-slate-400">Details</TableHead>
                                        <TableHead className="text-slate-400">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map(log => (
                                        <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800">
                                            <TableCell className="text-white font-medium">{log.action}</TableCell>
                                            <TableCell className="text-slate-300">{log.resource_type || '-'}</TableCell>
                                            <TableCell className="text-slate-400 text-xs font-mono max-w-xs truncate">
                                                {JSON.stringify(log.details)}
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {new Date(log.created_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                                                No logs found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AdminLogs;
