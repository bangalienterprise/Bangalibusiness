
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

const SystemSettings = () => {
    const { user, business } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [settings, setSettings] = useState({
        tax_rate: '0',
        currency: 'BDT',
        invoice_prefix: 'INV-',
        low_stock_threshold: '5',
        allow_credit_sales: true,
        default_payment_method: 'Cash'
    });

    useEffect(() => {
        if (business?.id) {
            loadSettings();
        }
    }, [business]);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('settings, logo_url')
                .eq('id', business.id)
                .single();

            if (error) throw error;

            if (data) {
                // Merge JSONB settings with default state and logo column
                setSettings(prev => ({
                    ...prev,
                    ...data.settings,
                    logo_url: data.logo_url
                }));
            }
        } catch (error) {
            console.error('Failed to load settings', error);
            // toast({ variant: "destructive", title: "Error loading settings" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Extract fields that might be columns vs JSONB (logo_url is a column)
            const { logo_url, ...jsonSettings } = settings;

            // Prepare updates for the businesses table
            const updates = {
                settings: jsonSettings,
                logo_url: logo_url // We update this here too just in case it wasn't updated by the upload handler
            };

            const { error } = await supabase
                .from('businesses')
                .update(updates)
                .eq('id', business.id);

            if (error) throw error;
            toast({ title: "Settings Saved", description: "Your business configurations have been updated." });

            // Refresh settings to ensure sync
            loadSettings();
        } catch (error) {
            console.error('Save failed', error);
            toast({ variant: "destructive", title: "Failed to save settings" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <Helmet><title>Settings - Bangali Enterprise</title></Helmet>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Business Settings</h1>
                    <p className="text-slate-400">Configure your store preferences and rules.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-800 text-slate-400 border border-slate-700">
                    <TabsTrigger value="general" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">General</TabsTrigger>
                    <TabsTrigger value="sales" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Sales & Invoice</TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Inventory</TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Notifications</TabsTrigger>
                    <TabsTrigger value="branding" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Branding</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card className="bg-slate-800 border-slate-700 text-white mt-4">
                        <CardHeader>
                            <CardTitle>General Configuration</CardTitle>
                            <CardDescription className="text-slate-400">Basic business defaults</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Currency Symbol</Label>
                                    <Input
                                        value={settings.currency}
                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                        className="bg-slate-900 border-slate-700"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Settings */}
                <TabsContent value="sales">
                    <Card className="bg-slate-800 border-slate-700 text-white mt-4">
                        <CardHeader>
                            <CardTitle>Sales & Invoicing</CardTitle>
                            <CardDescription className="text-slate-400">Configure tax and invoice formats</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Tax Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={settings.tax_rate}
                                        onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                                        className="bg-slate-900 border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Invoice Prefix</Label>
                                    <Input
                                        value={settings.invoice_prefix}
                                        onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                                        className="bg-slate-900 border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Payment Method</Label>
                                    <Select
                                        value={settings.default_payment_method}
                                        onValueChange={(val) => setSettings({ ...settings, default_payment_method: val })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                            <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/50 mt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow Credit Sales (Due)</Label>
                                    <p className="text-sm text-slate-400">Enable selling products with payment due later</p>
                                </div>
                                <Switch
                                    checked={settings.allow_credit_sales}
                                    onCheckedChange={(checked) => setSettings({ ...settings, allow_credit_sales: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Settings */}
                <TabsContent value="inventory">
                    <Card className="bg-slate-800 border-slate-700 text-white mt-4">
                        <CardHeader>
                            <CardTitle>Inventory Management</CardTitle>
                            <CardDescription className="text-slate-400">Stock alerts and control</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Low Stock Threshold (Global)</Label>
                                    <Input
                                        type="number"
                                        value={settings.low_stock_threshold}
                                        onChange={(e) => setSettings({ ...settings, low_stock_threshold: e.target.value })}
                                        className="bg-slate-900 border-slate-700"
                                    />
                                    <p className="text-xs text-slate-500">Products below this quantity will trigger an alert</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications">
                    <Card className="bg-slate-800 border-slate-700 text-white mt-4">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription className="text-slate-400">Choose what alerts you want to receive</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Low Stock Alerts</Label>
                                        <p className="text-sm text-slate-400">Get notified when products reach the low stock threshold</p>
                                    </div>
                                    <Switch
                                        checked={settings.notify_low_stock !== false} // Default to true if undefined
                                        onCheckedChange={(checked) => setSettings({ ...settings, notify_low_stock: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">New Order Alerts</Label>
                                        <p className="text-sm text-slate-400">Receive notifications for new online orders</p>
                                    </div>
                                    <Switch
                                        checked={settings.notify_new_orders !== false}
                                        onCheckedChange={(checked) => setSettings({ ...settings, notify_new_orders: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Daily Sales Report</Label>
                                        <p className="text-sm text-slate-400">Receive a summary of daily performance via email</p>
                                    </div>
                                    <Switch
                                        checked={settings.notify_daily_report === true}
                                        onCheckedChange={(checked) => setSettings({ ...settings, notify_daily_report: checked })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Branding Settings */}
                <TabsContent value="branding">
                    <Card className="bg-slate-800 border-slate-700 text-white mt-4">
                        <CardHeader>
                            <CardTitle>Brand Customization</CardTitle>
                            <CardDescription className="text-slate-400">Manage your business logo and appearance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-lg bg-slate-900 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden">
                                    {settings.logo_url ? (
                                        <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-slate-500 text-xs">No Logo</span>
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Business Logo</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="bg-slate-900 border-slate-700 text-white"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                try {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${business.id}-${Date.now()}.${fileExt}`;
                                                    const { error: uploadError } = await supabase.storage
                                                        .from('business-branding')
                                                        .upload(fileName, file);

                                                    if (uploadError) throw uploadError;

                                                    const { data: publicUrlData } = supabase.storage
                                                        .from('business-branding')
                                                        .getPublicUrl(fileName);

                                                    setSettings({ ...settings, logo_url: publicUrlData.publicUrl });

                                                    // Update business table directly for immediate effect
                                                    await supabase.from('businesses').update({ logo_url: publicUrlData.publicUrl }).eq('id', business.id);
                                                    toast({ title: "Logo Uploaded", description: "Your business logo has been updated. Reloading..." });
                                                    setTimeout(() => window.location.reload(), 1500);

                                                } catch (error) {
                                                    console.error('Upload failed', error);
                                                    toast({ variant: "destructive", title: "Upload Failed", description: error.message });
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Recommended size: 200x200px. formats: png, jpg.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </TabsContent>
            </Tabs>
        </div >
    );
};

export default SystemSettings;
