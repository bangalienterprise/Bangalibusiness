import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Camera, User } from 'lucide-react';
import { settingsService } from '@/services/SettingsService';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSettings = ({ initialData }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        avatar: initialData?.avatar || ''
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // For mock, create a fake URL
            const fakeUrl = URL.createObjectURL(file);
            setFormData({ ...formData, avatar: fakeUrl });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await settingsService.updateUserSettings(user.id, formData);
            toast({ title: "Profile Updated", description: "Your personal information has been saved." });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your photo and personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-slate-700">
                            <AvatarImage src={formData.avatar} />
                            <AvatarFallback className="bg-blue-600 text-xl font-bold">{formData.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-medium text-lg text-white">Profile Photo</h3>
                        <p className="text-sm text-slate-400">Click to upload a new avatar. JPG, GIF or PNG.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input 
                            value={formData.firstName} 
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input 
                            value={formData.lastName} 
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={formData.email} disabled className="bg-slate-950/50 border-slate-800 text-slate-500" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;