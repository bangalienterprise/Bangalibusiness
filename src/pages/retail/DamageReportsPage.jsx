
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useBusiness } from '@/contexts/BusinessContext';
import { AlertTriangle } from 'lucide-react';

const DamageReportsPage = () => {
    const { currentBusiness } = useBusiness();
    
    return (
        <div className="p-6 space-y-6">
            <Helmet><title>Damage Reports</title></Helmet>
            <h1 className="text-3xl font-bold">Damage Reports</h1>
            <Card>
                <CardContent className="py-10 text-center text-slate-500 flex flex-col items-center">
                    <AlertTriangle className="h-10 w-10 mb-4 text-orange-500" />
                    <p>Track damaged or expired stock here.</p>
                    <p className="text-sm mt-2">This feature is coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default DamageReportsPage;
