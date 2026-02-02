
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataIntegrityCheck } from '@/utils/dataIntegrityCheck';
import { FileCheck, ShieldAlert, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const IntegrityCard = ({ title, result }) => {
    if (!result) return <Card className="bg-slate-900 border-slate-800 h-32 animate-pulse" />;

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                {result.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                     <span className={`text-lg font-bold ${result.success ? 'text-white' : 'text-red-400'}`}>
                         {result.success ? 'Passed' : 'Issues Found'}
                     </span>
                     <p className="text-xs text-slate-500">{result.message}</p>
                     
                     {result.issues && result.issues.length > 0 && (
                         <div className="mt-2 text-xs bg-red-950/30 p-2 rounded text-red-300">
                             {result.issues.map((i, idx) => (
                                 <div key={idx}>{i.table}: {i.orphans} orphans</div>
                             ))}
                         </div>
                     )}
                </div>
            </CardContent>
        </Card>
    );
};

const DataIntegrityPage = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const runCheck = async () => {
        setLoading(true);
        const data = await dataIntegrityCheck.runFullDataIntegrityCheck();
        setResults(data);
        setLoading(false);
    };

    useEffect(() => {
        runCheck();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            <Helmet><title>Data Integrity | Admin</title></Helmet>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <FileCheck className="h-8 w-8 text-blue-500" /> Data Integrity
                    </h1>
                    <p className="text-slate-400">Validate data consistency and scoping</p>
                </div>
                <Button onClick={runCheck} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Run Check
                </Button>
            </div>

            {results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <IntegrityCard title="Business Scoping" result={results.results.businessScoping} />
                    <IntegrityCard title="Sales Validation" result={results.results.salesIntegrity} />
                    <IntegrityCard title="User Associations" result={results.results.userLinks} />
                </div>
            )}
        </div>
    );
};

export default DataIntegrityPage;
