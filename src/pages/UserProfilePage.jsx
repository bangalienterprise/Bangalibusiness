import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';

const UserProfilePage = () => {
    const { currentUser, user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        avatar_url: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                full_name: currentUser.full_name || '',
                phone: currentUser.phone || '',
                avatar_url: currentUser.avatar_url || ''
            });
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', user.id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Profile updated successfully" });
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet><title>My Profile - Bangali Enterprise</title></Helmet>
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={formData.avatar_url} />
                                    <AvatarFallback>{formData.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" type="button">Change Avatar</Button>
                            </div>
                            
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input 
                                        value={formData.full_name} 
                                        onChange={e => setFormData({...formData, full_name: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={user?.email} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 uppercase">
                                        {currentUser?.role}
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default UserProfilePage;