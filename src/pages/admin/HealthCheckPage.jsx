
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabaseHealthCheck } from '@/utils/supabaseHealthCheck';
import { Activity, Database, Shield, Link as LinkIcon, List, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { Helmet } from 'react-helmet';

const StatusBadge = ({ success }) => (
  <Badge variant={success ? "default" : "destructive"} className={success ? "bg-green-600" : "bg-red-600"}>
    {success ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
    {success ? "Healthy" : "Issues Found"}
  </Badge>
);

const HealthCheckPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runCheck = async () => {
    setLoading(true);
    const data = await supabaseHealthCheck.runFullHealthCheck();
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const exportReport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-check-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      <Helmet><title>System Health | Admin</title></Helmet>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-500" /> System Health
          </h1>
          <p className="text-slate-400">Database and infrastructure status monitor</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runCheck} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Run Full Check
          </Button>
          {results && (
            <Button variant="outline" onClick={exportReport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          )}
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connection */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Supabase Connection</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-white">{results.results.connection.success ? 'Connected' : 'Failed'}</span>
                <StatusBadge success={results.results.connection.success} />
              </div>
              <p className="text-xs text-slate-500">{results.results.connection.message}</p>
            </CardContent>
          </Card>

          {/* Tables */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Database Tables</CardTitle>
              <Database className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-white">
                    {results.results.tables.details?.found || 0}/{results.results.tables.details?.required || 13}
                </span>
                <StatusBadge success={results.results.tables.success} />
              </div>
              <p className="text-xs text-slate-500">{results.results.tables.message}</p>
            </CardContent>
          </Card>

          {/* RLS Policies */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">RLS Policies</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-white">
                    {results.results.rls.details?.length || 0} Active
                </span>
                <StatusBadge success={results.results.rls.success} />
              </div>
              <p className="text-xs text-slate-500">{results.results.rls.message}</p>
            </CardContent>
          </Card>

          {/* Foreign Keys */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Foreign Keys</CardTitle>
              <LinkIcon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-white">
                    {results.results.foreignKeys.details?.length || 0} Constraints
                </span>
                <StatusBadge success={results.results.foreignKeys.success} />
              </div>
              <p className="text-xs text-slate-500">{results.results.foreignKeys.message}</p>
            </CardContent>
          </Card>

          {/* Indexes */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Indexes</CardTitle>
              <List className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-white">
                    {results.results.indexes.details?.length || 0} Indexes
                </span>
                <StatusBadge success={results.results.indexes.success} />
              </div>
              <p className="text-xs text-slate-500">{results.results.indexes.message}</p>
            </CardContent>
          </Card>

          {/* Overall */}
          <Card className={`border-slate-800 ${results.success ? 'bg-green-950/20' : 'bg-red-950/20'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Overall Status</CardTitle>
              {results.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-bold ${results.success ? 'text-green-500' : 'text-red-500'}`}>
                    {results.success ? 'Operational' : 'Attention Needed'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Last checked: {new Date(results.timestamp).toLocaleTimeString()}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HealthCheckPage;
