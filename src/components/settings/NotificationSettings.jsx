import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Bell, Mail, MessageSquare } from 'lucide-react';
import { settingsService } from '@/services/SettingsService';
import { useAuth } from '@/contexts/AuthContext';

const NotificationSettings = ({ initialData }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [prefs, setPrefs] = useState({
        email: initialData?.email || true,
        marketing: initialData?.marketing || false,
        updates: initialData?.updates || true,
        sms: initialData?.sms || false,
        push: initialData?.push || false,
        frequency: initialData?.frequency || 'realtime'
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await settingsService.updateNotificationSettings(user.id, prefs);
            toast({ title: "Preferences Saved", description: "Your notification settings have been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const ToggleItem = ({ label, desc, checked, onChange, icon: Icon }) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
            <div className="flex gap-3">
                <div className="mt-1">
                    <Icon className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                    <Label className="text-base font-medium text-white block mb-1">{label}</Label>
                    <p className="text-sm text-slate-400">{desc}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-blue-600" />
        </div>
    );

    return (
        <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Email Notifications</h3>
                    <ToggleItem 
                        icon={Mail}
                        label="Essential Emails" 
                        desc="Order confirmations, security alerts, and account updates."
                        checked={prefs.email} 
                        onChange={(c) => setPrefs({...prefs, email: c})}
                    />
                    <ToggleItem 
                        icon={Mail}
                        label="Product Updates" 
                        desc="News about new features and improvements."
                        checked={prefs.updates} 
                        onChange={(c) => setPrefs({...prefs, updates: c})}
                    />
                    <ToggleItem 
                        icon={Mail}
                        label="Marketing" 
                        desc="Tips, offers, and promotions."
                        checked={prefs.marketing} 
                        onChange={(c) => setPrefs({...prefs, marketing: c})}
                    />
                </div>

                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Other Channels</h3>
                    <ToggleItem 
                        icon={MessageSquare}
                        label="SMS Notifications" 
                        desc="Get urgent alerts directly to your phone."
                        checked={prefs.sms} 
                        onChange={(c) => setPrefs({...prefs, sms: c})}
                    />
                    <ToggleItem 
                        icon={Bell}
                        label="Browser Push" 
                        desc="Receive notifications even when you're not on the site."
                        checked={prefs.push} 
                        onChange={(c) => setPrefs({...prefs, push: c})}
                    />
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <Label className="block mb-2">Notification Frequency</Label>
                    <Select value={prefs.frequency} onValueChange={(val) => setPrefs({...prefs, frequency: val})}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 w-full md:w-[300px]">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Summary</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Preferences
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationSettings;