import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Info, Percent, FileText, Database } from 'lucide-react';

import GeneralInfoTab from '@/components/settings/GeneralInfoTab';
import SalesAndTaxTab from '@/components/settings/SalesAndTaxTab';
import InvoiceCustomizationTab from '@/components/settings/InvoiceCustomizationTab';
import BackupAndResetTab from '@/components/settings/BackupAndResetTab';

const SystemSettingsPage = () => {
    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <Helmet>
                <title>System Settings | Retail Store</title>
            </Helmet>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
                <p className="text-slate-400">Manage your store configuration, taxes, and data.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 text-slate-400 w-full justify-start h-auto p-1 mb-6 overflow-x-auto flex-nowrap">
                    <TabsTrigger value="general" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white flex gap-2 items-center px-4 py-2">
                        <Info className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white flex gap-2 items-center px-4 py-2">
                        <Percent className="h-4 w-4" /> Sales & Tax
                    </TabsTrigger>
                    <TabsTrigger value="invoice" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white flex gap-2 items-center px-4 py-2">
                        <FileText className="h-4 w-4" /> Invoice
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white flex gap-2 items-center px-4 py-2">
                        <Database className="h-4 w-4" /> Data
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0 space-y-4">
                    <GeneralInfoTab />
                </TabsContent>
                
                <TabsContent value="sales" className="mt-0 space-y-4">
                    <SalesAndTaxTab />
                </TabsContent>
                
                <TabsContent value="invoice" className="mt-0 space-y-4">
                    <InvoiceCustomizationTab />
                </TabsContent>
                
                <TabsContent value="backup" className="mt-0 space-y-4">
                    <BackupAndResetTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemSettingsPage;