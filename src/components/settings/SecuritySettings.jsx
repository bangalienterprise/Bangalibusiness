import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield, Smartphone, Laptop } from 'lucide-react';
import { settingsService } from '@/services/SettingsService';
import { useAuth } from '@/contexts/AuthContext';
import { calculatePasswordStrength } from '@/lib/formValidation';
import { cn } from '@/lib/utils';

const SecuritySettings = ({ initialData }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [twoFactor, setTwoFactor] = useState(initialData?.twoFactorEnabled || false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPasswords({ ...passwords, new: val });
        setPasswordStrength(calculatePasswordStrength(val));
    };

    const handleSavePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast({ variant: "destructive", title: "Error", description: "New passwords do not match" });
            return;
        }
        setLoading(true);
        try {
            await settingsService.changePassword(user.id, passwords.current, passwords.new);
            toast({ title: "Success", description: "Password changed successfully" });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const toggleTwoFactor = async (checked) => {
        setTwoFactor(checked);
        try {
            await settingsService.updateSecuritySettings(user.id, { twoFactorEnabled: checked });
            toast({ title: checked ? "2FA Enabled" : "2FA Disabled" });
        } catch (error) {
            setTwoFactor(!checked); // revert
            toast({ variant: "destructive", title: "Error", description: "Could not update 2FA settings" });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Password Change</CardTitle>
                    <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 max-w-xl">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="bg-slate-950 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" value={passwords.new} onChange={handlePasswordChange} className="bg-slate-950 border-slate-700" />
                            {passwords.new && (
                                <div className="h-1 w-full bg-slate-800 rounded overflow-hidden mt-1">
                                    <div className={cn("h-full transition-all", passwordStrength.color)} style={{ width: `${(passwordStrength.score + 1) * 20}%` }} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="bg-slate-950 border-slate-700" />
                        </div>
                        <Button onClick={handleSavePassword} disabled={loading} className="bg-blue-600 hover:bg-blue-500 w-fit">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950/30">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">Authenticator App</h4>
                                <p className="text-sm text-slate-400">Use an app like Google Authenticator to generate codes.</p>
                            </div>
                        </div>
                        <Switch checked={twoFactor} onCheckedChange={toggleTwoFactor} className="data-[state=checked]:bg-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Login History</CardTitle>
                    <CardDescription>Recent activity on your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {initialData?.loginHistory?.map((login, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                                <div className="flex items-center gap-3">
                                    {login.device.includes('iPhone') || login.device.includes('Android') ? 
                                        <Smartphone className="h-5 w-5 text-slate-500" /> : 
                                        <Laptop className="h-5 w-5 text-slate-500" />
                                    }
                                    <div>
                                        <p className="text-sm font-medium text-white">{login.device}</p>
                                        <p className="text-xs text-slate-500">{login.location} • {new Date(login.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-green-500 font-medium">Active</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SecuritySettings;