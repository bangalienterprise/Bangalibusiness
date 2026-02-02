import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { settingsService } from '@/services/SettingsService';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/lib/services/MockDatabase';

const BusinessSettings = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        address: '',
        phone: '',
        website: '',
        description: ''
    });

    useEffect(() => {
        const loadBusiness = async () => {
            if(user?.business_id) {
                const business = await mockDatabase.getBusinessData(user.business_id);
                if(business) {
                    setFormData({
                        name: business.name || '',
                        type: business.type || '',
                        address: business.address || '',
                        phone: business.phone || '',
                        website: business.website || '',
                        description: business.description || ''
                    });
                }
            }
        };
        loadBusiness();
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await settingsService.updateBusinessSettings(user.business_id, formData);
            toast({ title: "Business Updated", description: "Business details have been saved." });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>Manage your public business information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Business Type</Label>
                        <Select 
                            value={formData.type} 
                            onValueChange={(val) => setFormData({...formData, type: val})}
                        >
                            <SelectTrigger className="bg-slate-950 border-slate-700">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="retail">Retail Store</SelectItem>
                                <SelectItem value="agency">Agency</SelectItem>
                                <SelectItem value="service">Service Provider</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="freelancer">Freelancer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Address</Label>
                        <Input 
                            value={formData.address} 
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                            placeholder="123 Main St, City, Country"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Website</Label>
                        <Input 
                            value={formData.website} 
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            className="bg-slate-950 border-slate-700" 
                            placeholder="https://"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="bg-slate-950 border-slate-700 min-h-[100px]" 
                            placeholder="Tell us about your business..."
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

export default BusinessSettings;