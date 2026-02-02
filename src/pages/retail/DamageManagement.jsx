import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DamageForm from '@/components/damage/DamageForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const DamageManagement = () => {
    const handleRefresh = () => {
        // Trigger a refresh or toast if needed
    };

    return (
        <div className="space-y-6 pb-10">
            <Helmet><title>Damage Management</title></Helmet>
            
            <div>
                <h1 className="text-3xl font-bold text-white">Damage Management</h1>
                <p className="text-slate-400">Record and track damaged inventory.</p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" /> Damage Report
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DamageForm onDamageConfirmed={handleRefresh} />
                </CardContent>
            </Card>
        </div>
    );
};

export default DamageManagement;