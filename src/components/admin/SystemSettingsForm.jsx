import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SystemSettingsForm = () => {
    const { toast } = useToast();

    const handleSave = () => {
        toast({ title: "Saved", description: "System settings updated successfully." });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Application</CardTitle>
                    <CardDescription>Basic information about the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Application Name</Label>
                            <Input defaultValue="Bangali Enterprise" />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="support@bangalienterprise.com" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Feature Toggles</CardTitle>
                    <CardDescription>Enable or disable global system features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="reg">Public Registration</Label>
                        <Switch id="reg" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="maint">Maintenance Mode</Label>
                        <Switch id="maint" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="beta">Beta Features</Label>
                        <Switch id="beta" />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" /> Save All Changes
                </Button>
            </div>
        </div>
    );
};

export default SystemSettingsForm;