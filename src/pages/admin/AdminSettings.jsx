
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminSettings = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <AdminHeader />
            <main className="ml-64 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-white mb-6">System Settings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-white">General Configuration</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>System Name</Label>
                                <Input defaultValue="Bangali Enterprise" className="bg-slate-950 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Support Email</Label>
                                <Input defaultValue="support@bangali.app" className="bg-slate-950 border-slate-700" />
                            </div>
                            <Button className="w-full">Save General Settings</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-white">Backup & Maintenance</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-slate-950 rounded border border-slate-800">
                                <p className="text-sm text-slate-400 mb-2">Last Backup: 2 hours ago</p>
                                <p className="text-sm text-green-500">Status: Healthy</p>
                            </div>
                            <Button variant="secondary" className="w-full">Trigger Manual Backup</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
