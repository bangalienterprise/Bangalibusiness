import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { validateStoreName, validatePhone, validateAddress } from '@/utils/settingsValidator';
import { Store, Upload } from 'lucide-react';

const GeneralInfoTab = () => {
    const { settings, updateSettings } = useSettings();
    const { toast } = useToast();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings?.general_info) {
            setFormData(settings.general_info);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error on change
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSave = async () => {
        const newErrors = {};
        const nameErr = validateStoreName(formData.store_name);
        const phoneErr = validatePhone(formData.phone);
        const addrErr = validateAddress(formData.address);

        if (nameErr) newErrors.store_name = nameErr;
        if (phoneErr) newErrors.phone = phoneErr;
        if (addrErr) newErrors.address = addrErr;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            await updateSettings({ ...settings, general_info: formData });
        } catch (e) {
            // Toast handled in context
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-blue-500" /> Store Information
                </CardTitle>
                <CardDescription>Basic details about your business displayed on receipts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Store Name <span className="text-red-500">*</span></Label>
                        <Input 
                            name="store_name" 
                            value={formData.store_name || ''} 
                            onChange={handleChange}
                            className={`bg-slate-950 border-slate-700 ${errors.store_name ? 'border-red-500' : ''}`}
                        />
                        {errors.store_name && <p className="text-xs text-red-500">{errors.store_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                        <Input 
                            name="phone" 
                            value={formData.phone || ''} 
                            onChange={handleChange}
                            className={`bg-slate-950 border-slate-700 ${errors.phone ? 'border-red-500' : ''}`}
                        />
                         {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Address <span className="text-red-500">*</span></Label>
                        <Input 
                            name="address" 
                            value={formData.address || ''} 
                            onChange={handleChange}
                            className={`bg-slate-950 border-slate-700 ${errors.address ? 'border-red-500' : ''}`}
                        />
                         {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                            name="email" 
                            value={formData.email || ''} 
                            onChange={handleChange}
                            className="bg-slate-950 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Website</Label>
                        <Input 
                            name="website" 
                            value={formData.website || ''} 
                            onChange={handleChange}
                            className="bg-slate-950 border-slate-700"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Logo URL</Label>
                        <div className="flex gap-2">
                            <Input 
                                name="logo_url" 
                                value={formData.logo_url || ''} 
                                onChange={handleChange}
                                className="bg-slate-950 border-slate-700"
                                placeholder="https://..."
                            />
                            <Button variant="outline" className="border-slate-700 shrink-0">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default GeneralInfoTab;