
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('system_settings').select('*').single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"

      if (data) {
        // Merge explicit columns and JSONB configurations
        setSettings({
          ...data.configurations,
          app_name: data.platform_name,
          maintenance_mode: data.maintenance_mode,
          id: data.id // Keep ID for updates
        });
      } else {
        // Fallback or init if no row exists (though seed data should exist)
        setSettings({});
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // toast({ variant: "destructive", title: "Failed to load settings" }); 
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Separate column fields from JSONB fields
      const { app_name, maintenance_mode, id, ...configFields } = settings;

      const updates = {
        platform_name: app_name,
        maintenance_mode: maintenance_mode === 'true' || maintenance_mode === true,
        configurations: configFields,
        // No updated_at column in the provided schema for this table, skipping
      };

      let error;
      if (id) {
        const { error: updateError } = await supabase
          .from('system_settings')
          .update(updates)
          .eq('id', id);
        error = updateError;
      } else {
        // If no row exists, insert one
        const { error: insertError } = await supabase
          .from('system_settings')
          .insert([updates]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: "Settings Saved", description: "System configuration updated." });
      fetchSettings(); // Refresh to get any server-side generated fields if needed
    } catch (error) {
      console.error('Save failed', error);
      toast({ variant: "destructive", title: "Failed to save settings", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading settings..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <Button onClick={handleSave} className="bg-blue-600">Save Changes</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-800 text-slate-400">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-[#1e293b] border-slate-700 text-white">
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription className="text-slate-400">Basic global settings for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Application Name</Label>
                <Input
                  value={settings.app_name || ''}
                  onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
              <div className="grid gap-2">
                <Label>Application URL</Label>
                <Input
                  value={settings.app_url || ''}
                  onChange={(e) => setSettings({ ...settings, app_url: e.target.value })}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900">
                <div>
                  <Label className="text-base">Enable Public Signups</Label>
                  <p className="text-sm text-slate-400">Allow users to create accounts freely.</p>
                </div>
                <Switch
                  checked={settings.enable_signup === 'true'}
                  onCheckedChange={(checked) => setSettings({ ...settings, enable_signup: String(checked) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-[#1e293b] border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Security Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Password Min Length</Label>
                <Input
                  type="number"
                  value={settings.password_min_length || '8'}
                  onChange={(e) => setSettings({ ...settings, password_min_length: e.target.value })}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-900">
                <div>
                  <Label className="text-base">Require 2FA</Label>
                  <p className="text-sm text-slate-400">Force Two-Factor Authentication for all admins.</p>
                </div>
                <Switch
                  checked={settings.require_2fa === 'true'}
                  onCheckedChange={(checked) => setSettings({ ...settings, require_2fa: String(checked) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="bg-[#1e293b] border-slate-700 text-white">
            <CardHeader>
              <CardTitle>Email Configuration (SMTP)</CardTitle>
              <CardDescription className="text-slate-400">Configure how the system sends transactional emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.example.com"
                    value={settings.smtp_host || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    className="bg-slate-900 border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>SMTP Port</Label>
                  <Input
                    placeholder="587"
                    value={settings.smtp_port || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                    className="bg-slate-900 border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>SMTP User</Label>
                  <Input
                    placeholder="user@example.com"
                    value={settings.smtp_user || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                    className="bg-slate-900 border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={settings.smtp_pass || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                    className="bg-slate-900 border-slate-600"
                  />
                </div>
              </div>
              <div className="grid gap-2 mt-4">
                <Label>From Email Address</Label>
                <Input
                  placeholder="noreply@bangalienterprise.com"
                  value={settings.from_email || ''}
                  onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
