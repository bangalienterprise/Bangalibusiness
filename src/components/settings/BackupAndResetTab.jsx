import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Database, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BackupAndResetTab = () => {
    const { factoryReset, exportData, settings } = useSettings();
    const [downloading, setDownloading] = useState(false);

    const handleExport = async () => {
        setDownloading(true);
        try {
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${settings?.general_info?.store_name || 'store'}-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-orange-500" /> Data Management
                </CardTitle>
                <CardDescription>Backup your data or reset the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <div className="flex items-center justify-between border p-4 rounded-lg border-slate-800 bg-slate-950/50">
                    <div className="space-y-1">
                        <p className="font-medium">Export Data</p>
                        <p className="text-sm text-slate-400">Download a JSON copy of all your business data.</p>
                    </div>
                    <Button variant="outline" onClick={handleExport} disabled={downloading} className="border-slate-700">
                        <Download className="mr-2 h-4 w-4" /> 
                        {downloading ? 'Exporting...' : 'Export'}
                    </Button>
                </div>

                <div className="flex items-center justify-between border p-4 rounded-lg border-red-900/30 bg-red-950/10">
                    <div className="space-y-1">
                        <p className="font-medium text-red-400">Factory Reset</p>
                        <p className="text-sm text-slate-400">Clear all sales, customers and expenses. Products will be kept.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="bg-red-900/50 hover:bg-red-900 text-red-200">
                                <RotateCcw className="mr-2 h-4 w-4" /> Reset System
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                                    <AlertTriangle className="h-5 w-5" /> Warning
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-300">
                                    Are you sure? This action cannot be undone. All sales history, customer data, and expense records will be permanently deleted. Your products and settings will remain.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={factoryReset} className="bg-red-600 hover:bg-red-700">
                                    Yes, Reset Everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </CardContent>
        </Card>
    );
};

export default BackupAndResetTab;