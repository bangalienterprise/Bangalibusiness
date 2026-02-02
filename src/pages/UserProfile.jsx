
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, profile, logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Password Change State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ variant: "destructive", title: "Passwords do not match" });
            return;
        }
        if (passwordData.newPassword.length < 6) {
             toast({ variant: "destructive", title: "Password must be at least 6 characters" });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            toast({ title: "Success", description: "Password updated successfully" });
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Failed to update password", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
             <Helmet><title>My Profile - Bangali Enterprise</title></Helmet>

             <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white uppercase">
                    {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{profile?.full_name}</h1>
                    <p className="text-slate-400">{profile?.role?.replace('_', ' ').toUpperCase()}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Info */}
                <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" /> Personal Information
                        </CardTitle>
                        <CardDescription className="text-slate-400">Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Full Name</Label>
                            <Input value={profile?.full_name || ''} disabled className="bg-slate-900 border-slate-700 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Email Address</Label>
                            <Input value={user?.email || ''} disabled className="bg-slate-900 border-slate-700 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Role</Label>
                            <Input value={profile?.role || ''} disabled className="bg-slate-900 border-slate-700 text-slate-400 uppercase" />
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-yellow-500" /> Security
                        </CardTitle>
                        <CardDescription className="text-slate-400">Update your password</CardDescription>
                    </CardHeader>
                    <form onSubmit={updatePassword}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" classname="text-slate-300">New Password</Label>
                                <Input 
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-slate-900 border-slate-700 text-white"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" classname="text-slate-300">Confirm Password</Label>
                                <Input 
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-slate-900 border-slate-700 text-white"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
             </div>

             <div className="flex justify-end">
                <Button variant="destructive" className="gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Sign Out
                </Button>
             </div>
        </div>
    );
};

export default UserProfile;
