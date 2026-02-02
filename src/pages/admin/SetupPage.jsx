
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { databaseInitService } from '@/services/databaseInitService';
import { adminSetupService } from '@/services/adminSetupService';
import { setupTest } from '@/utils/setupTest';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const SetupPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleInitDB = async () => {
    setLoading(true);
    addLog('Starting Database Initialization...', 'info');
    const res = await databaseInitService.initializeDatabase();
    addLog(res.message, res.success ? 'success' : 'error');
    setLoading(false);
  };

  const handleCreateAccounts = async () => {
    setLoading(true);
    addLog('Creating Admin & Demo Accounts...', 'info');
    const res = await adminSetupService.initializeAllAccounts();
    res.results.forEach(r => {
      addLog(r.message, r.success ? 'success' : 'error');
    });
    setLoading(false);
  };

  const handleRunTests = async () => {
    setLoading(true);
    addLog('Running System Tests...', 'info');
    const results = await setupTest.runAllTests();
    setTestResults(results);
    results.forEach(r => {
        addLog(r.message, r.success ? 'success' : 'error');
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-bold text-white mb-8">System Setup & Verification</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
             <CardHeader><CardTitle className="text-white">Actions</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <Button onClick={handleInitDB} disabled={loading} className="w-full bg-blue-600">
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Initialize Database
                </Button>
                <Button onClick={handleCreateAccounts} disabled={loading} className="w-full bg-purple-600">
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Admin Accounts
                </Button>
                <Button onClick={handleRunTests} disabled={loading} className="w-full bg-green-600">
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Run Diagnostics
                </Button>
             </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
             <CardHeader><CardTitle className="text-white">Test Results</CardTitle></CardHeader>
             <CardContent>
                {testResults.length === 0 ? <p className="text-slate-500">No tests run yet.</p> : (
                    <div className="space-y-2">
                        {testResults.map((res, i) => (
                            <div key={i} className="flex items-center gap-2">
                                {res.success ? <CheckCircle className="text-green-500 h-5 w-5"/> : <XCircle className="text-red-500 h-5 w-5"/>}
                                <span className="text-slate-300">{res.message}</span>
                            </div>
                        ))}
                    </div>
                )}
             </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">Operation Logs</CardTitle></CardHeader>
            <CardContent>
                <div className="h-64 overflow-y-auto bg-slate-950 p-4 rounded border border-slate-800 font-mono text-sm">
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 ${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'success' ? 'text-green-400' : 'text-slate-400'
                        }`}>
                            <span className="text-slate-600 mr-2">[{log.time}]</span>
                            {log.msg}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SetupPage;
