
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { accountVerification } from '@/utils/accountVerification';
import { adminSetupService } from '@/services/adminSetupService';
import { Users, CheckCircle, XCircle, AlertTriangle, Loader2, Download, RefreshCcw } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandler';

const AccountCard = ({ title, result, loading }) => {
  if (loading) return <Card className="bg-slate-900 border-slate-800 h-40 animate-pulse" />;
  
  if (!result) return null;

  const isSuccess = result.success;
  const isWarning = result.warning;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base text-slate-300">{title}</CardTitle>
          {isSuccess ? 
             (isWarning ? <AlertTriangle className="text-yellow-500 h-5 w-5"/> : <CheckCircle className="text-green-500 h-5 w-5"/>) : 
             <XCircle className="text-red-500 h-5 w-5"/>
          }
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
            <p className="text-sm font-mono text-white truncate" title={result.email}>{result.email}</p>
            {isSuccess ? (
                <>
                    <div className="flex gap-2 mt-2">
                         <Badge variant="outline" className="border-slate-700 text-slate-400">{result.profile?.role}</Badge>
                         {result.user?.email_confirmed_at && <Badge variant="outline" className="border-green-900 text-green-500 bg-green-900/10">Confirmed</Badge>}
                    </div>
                    {isWarning && <p className="text-xs text-yellow-500 mt-2">{result.warning}</p>}
                </>
            ) : (
                <p className="text-xs text-red-400 mt-2">{result.message}</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

const AccountVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runVerification = async () => {
    setLoading(true);
    const data = await accountVerification.verifyAllAccounts();
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const handleFixAccounts = async () => {
    setActionLoading(true);
    try {
        const res = await adminSetupService.initializeAllAccounts();
        if (res.allSuccess) {
            showSuccessToast('All missing accounts created/verified.');
        } else {
            showErrorToast('Some accounts could not be created. Check logs.');
        }
        await runVerification();
    } catch (e) {
        showErrorToast(e.message);
    }
    setActionLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
       <Helmet><title>Account Verification | Admin</title></Helmet>

       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-500" /> Account Verification
          </h1>
          <p className="text-slate-400">Verify core system accounts and roles</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={runVerification} disabled={loading} variant="outline">
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
           </Button>
           <Button onClick={handleFixAccounts} disabled={actionLoading || loading} className="bg-purple-600 hover:bg-purple-500">
               {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />} 
               Create Missing Accounts
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AccountCard title="System Administrator" result={results?.results[0]} loading={loading} />
          <AccountCard title="Retail Owner" result={results?.results[1]} loading={loading} />
          <AccountCard title="Store Manager" result={results?.results[2]} loading={loading} />
          <AccountCard title="Sales Associate" result={results?.results[3]} loading={loading} />
      </div>

      {results && !results.success && (
          <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                  <h3 className="text-red-400 font-bold">Issues Detected</h3>
                  <p className="text-slate-400 text-sm">One or more core accounts are missing or misconfigured. Use the "Create Missing Accounts" button to auto-fix.</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default AccountVerificationPage;
