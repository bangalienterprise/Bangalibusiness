
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const AdminProfile = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <AdminHeader />
            <main className="ml-64 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-white mb-6">Profile & Security</h1>
                
                <div className="max-w-2xl space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-white">Personal Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input defaultValue={user?.user_metadata?.full_name || ''} className="bg-slate-950 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user?.email || ''} disabled className="bg-slate-950 border-slate-700 opacity-50" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle className="text-white">Security</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input type="password" className="bg-slate-950 border-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input type="password" className="bg-slate-950 border-slate-700" />
                            </div>
                            <Button variant="destructive">Update Password</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
