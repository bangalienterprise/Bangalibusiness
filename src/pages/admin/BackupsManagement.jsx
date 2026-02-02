
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const BackupsManagement = () => {
  // Mock data as backups are usually handled by Supabase platform directly or via edge functions
  const backups = [
    { id: 'bk_1', date: '2024-03-20 02:00 AM', size: '45 MB', status: 'completed' },
    { id: 'bk_2', date: '2024-03-19 02:00 AM', size: '44 MB', status: 'completed' },
    { id: 'bk_3', date: '2024-03-18 02:00 AM', size: '42 MB', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Backups Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Database className="h-4 w-4 mr-2" /> Create Backup Now
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <Card className="bg-[#1e293b] border-slate-700 text-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Schedule</CardTitle></CardHeader>
            <CardContent><div className="text-xl font-bold">Daily @ 02:00 AM</div></CardContent>
         </Card>
         <Card className="bg-[#1e293b] border-slate-700 text-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Retention</CardTitle></CardHeader>
            <CardContent><div className="text-xl font-bold">30 Days</div></CardContent>
         </Card>
         <Card className="bg-[#1e293b] border-slate-700 text-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Last Backup</CardTitle></CardHeader>
            <CardContent><div className="text-xl font-bold text-green-500">Success</div></CardContent>
         </Card>
      </div>

      <Card className="bg-[#1e293b] border-slate-700 text-white">
        <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription className="text-slate-400">List of automated and manual backups.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader className="bg-slate-900">
                    <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Backup ID</TableHead>
                        <TableHead className="text-slate-400">Date Created</TableHead>
                        <TableHead className="text-slate-400">Size</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {backups.map(bk => (
                        <TableRow key={bk.id} className="border-slate-700 hover:bg-slate-800">
                            <TableCell className="font-mono text-slate-300">{bk.id}</TableCell>
                            <TableCell className="text-slate-300">{bk.date}</TableCell>
                            <TableCell className="text-slate-300">{bk.size}</TableCell>
                            <TableCell><Badge className="bg-green-900 text-green-300 hover:bg-green-900">Completed</Badge></TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><RefreshCw className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupsManagement;
