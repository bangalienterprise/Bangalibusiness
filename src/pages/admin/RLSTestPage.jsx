
import React, { useState } from 'react';
import { isDevelopment } from '@/config/environment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    testGlobalAdminAccess, 
    testBusinessOwnerAccess, 
    testBusinessMemberAccess, 
    testAccessDenial 
} from '@/utils/rlsTest';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

const RLSTestPage = () => {
    const { businessId } = useCurrentBusiness();
    const [results, setResults] = useState([]);

    if (!isDevelopment()) {
        return null;
    }

    const runTest = async (name, testFn) => {
        setResults(prev => [...prev, { name, status: 'Running...' }]);
        const result = await testFn();
        setResults(prev => prev.map(r => r.name === name ? { 
            name, 
            status: result.success ? 'PASSED' : 'FAILED', 
            message: result.message 
        } : r));
    };

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">RLS Policy Testing</h1>
            <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded mb-6 text-yellow-200">
                This page is only visible in development mode
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-white">Run Tests</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            className="w-full bg-blue-600" 
                            onClick={() => runTest('Global Admin Access', testGlobalAdminAccess)}
                        >
                            Test Global Admin Access
                        </Button>
                        <Button 
                            className="w-full bg-green-600" 
                            onClick={() => runTest('Business Owner Access', () => testBusinessOwnerAccess(businessId))}
                            disabled={!businessId}
                        >
                            Test Business Owner Access
                        </Button>
                        <Button 
                            className="w-full bg-purple-600" 
                            onClick={() => runTest('Business Member Access', () => testBusinessMemberAccess(businessId))}
                            disabled={!businessId}
                        >
                            Test Business Member Access
                        </Button>
                        <Button 
                            className="w-full bg-red-600" 
                            onClick={() => runTest('Access Denial', testAccessDenial)}
                        >
                            Test Access Denial
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-white">Results</CardTitle></CardHeader>
                    <CardContent>
                        {results.length === 0 && <p className="text-slate-500">No tests run yet.</p>}
                        <ul className="space-y-3">
                            {results.map((res, i) => (
                                <li key={i} className="border-b border-slate-800 pb-2 last:border-0">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{res.name}</span>
                                        <span className={`font-bold ${
                                            res.status === 'PASSED' ? 'text-green-500' : 
                                            res.status === 'FAILED' ? 'text-red-500' : 'text-blue-400'
                                        }`}>
                                            {res.status}
                                        </span>
                                    </div>
                                    {res.message && <p className="text-xs text-slate-400 mt-1">{res.message}</p>}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RLSTestPage;
