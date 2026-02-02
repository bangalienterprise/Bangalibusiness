import React from 'react';
import { Helmet } from 'react-helmet';
import { Settings, User, Bell, Database, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <Helmet><title>Settings - Bangali Enterprise</title></Helmet>
            <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-slate-800 text-slate-400">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="data">Data Management</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="bg-slate-800 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription className="text-slate-400">Manage your personal account information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input defaultValue={user?.full_name} className="bg-slate-900 border-slate-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input defaultValue={user?.email} disabled className="bg-slate-900 border-slate-700 text-slate-400" />
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-500">Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="business">
                    <Card className="bg-slate-800 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                            <CardDescription className="text-slate-400">Update your business details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Business Name</Label>
                                <Input placeholder="My Business" className="bg-slate-900 border-slate-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input placeholder="+880..." className="bg-slate-900 border-slate-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input placeholder="Dhaka, Bangladesh" className="bg-slate-900 border-slate-700 text-white" />
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-500">Update Business</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="bg-slate-800 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription className="text-slate-400">Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-slate-400">Receive daily summaries and alerts.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">SMS Alerts</Label>
                                    <p className="text-sm text-slate-400">Urgent account security alerts only.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data">
                    <Card className="bg-slate-800 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription className="text-slate-400">Export your data or manage storage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                                <h4 className="font-medium mb-2">Export Data</h4>
                                <p className="text-sm text-slate-400 mb-4">Download a CSV copy of all your business data.</p>
                                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">Export to CSV</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;