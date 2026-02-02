import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const SettingsPage = () => {
  const { business } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: business?.name || '',
      address: business?.settings?.address || '',
      phone: business?.settings?.phone || '',
      currency: business?.settings?.currency || 'BDT'
  });

  const handleSave = async (section) => {
      if (!business?.id) return;
      setLoading(true);
      try {
          const updates = {
              name: formData.name,
              settings: {
                  ...business.settings,
                  address: formData.address,
                  phone: formData.phone,
                  currency: formData.currency
              }
          };

          const { error } = await supabase
            .from('businesses')
            .update(updates)
            .eq('id', business.id);

          if (error) throw error;
          toast({ title: "Settings saved", description: `${section} settings updated successfully.` });
      } catch (error) {
          toast({ variant: "destructive", title: "Update failed", description: error.message });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <Helmet><title>Settings - Bangali Enterprise</title></Helmet>
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-slate-400">Manage your business configuration.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-800 text-slate-400">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic display options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="bg-slate-950 border-slate-700" 
                />
              </div>
               <div className="space-y-2">
                <Label>Currency</Label>
                <Input 
                    value={formData.currency} 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="bg-slate-950 border-slate-700" 
                />
              </div>
              <Button onClick={() => handleSave('General')} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
           <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>This information will appear on invoices.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Full Address" 
                    className="bg-slate-950 border-slate-700" 
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+880..." 
                    className="bg-slate-950 border-slate-700" 
                />
              </div>
               <Button onClick={() => handleSave('Business')} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
               </Button>
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;