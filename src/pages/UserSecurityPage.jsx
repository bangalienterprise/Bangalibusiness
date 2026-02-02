import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Helmet } from 'react-helmet';

const UserSecurityPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: passwords.new });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Password updated successfully" });
            setPasswords({ new: '', confirm: '' });
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet><title>Security - Bangali Enterprise</title></Helmet>
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Security</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input 
                                    type="password" 
                                    value={passwords.new} 
                                    onChange={e => setPasswords({...passwords, new: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input 
                                    type="password" 
                                    value={passwords.confirm} 
                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default UserSecurityPage;