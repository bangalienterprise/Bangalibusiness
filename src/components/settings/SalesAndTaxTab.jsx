import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import { validateTaxRate, validateDiscountLimit } from '@/utils/settingsValidator';
import { Percent } from 'lucide-react';

const SalesAndTaxTab = () => {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings?.sales_tax) {
            setFormData(settings.sales_tax);
        }
    }, [settings]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };

    const handleSave = async () => {
        const newErrors = {};
        if (formData.enable_tax) {
            const err = validateTaxRate(formData.tax_rate);
            if (err) newErrors.tax_rate = err;
        }
        if (formData.enable_discount) {
            const err = validateDiscountLimit(formData.discount_limit);
            if (err) newErrors.discount_limit = err;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSaving(true);
        try {
            await updateSettings({ ...settings, sales_tax: formData });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-green-500" /> Sales & Tax Configuration
                </CardTitle>
                <CardDescription>Configure how taxes, discounts, and currencies are handled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                        <Label>Currency Symbol</Label>
                        <p className="text-xs text-slate-400">Used on receipts and UI.</p>
                    </div>
                    <Select value={formData.currency_symbol} onValueChange={(v) => handleChange('currency_symbol', v)}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="৳">Taka (৳)</SelectItem>
                            <SelectItem value="$">Dollar ($)</SelectItem>
                            <SelectItem value="€">Euro (€)</SelectItem>
                            <SelectItem value="£">Pound (£)</SelectItem>
                            <SelectItem value="¥">Yen (¥)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tax */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                        <Label>Enable Tax Calculation</Label>
                        <p className="text-xs text-slate-400">Apply tax rate to all sales.</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                         <Switch 
                            checked={formData.enable_tax} 
                            onCheckedChange={(c) => handleChange('enable_tax', c)}
                         />
                         {formData.enable_tax && (
                            <div className="w-24">
                                <Input 
                                    type="number"
                                    value={formData.tax_rate}
                                    onChange={(e) => handleChange('tax_rate', e.target.value)}
                                    className={`bg-slate-950 border-slate-700 ${errors.tax_rate ? 'border-red-500' : ''}`}
                                    placeholder="%"
                                />
                            </div>
                         )}
                    </div>
                </div>

                {/* Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                        <Label>Enable Discounts</Label>
                        <p className="text-xs text-slate-400">Allow cashiers to apply discounts.</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                         <Switch 
                            checked={formData.enable_discount} 
                            onCheckedChange={(c) => handleChange('enable_discount', c)}
                         />
                         {formData.enable_discount && (
                            <div className="w-40 space-y-1">
                                <Label className="text-xs">Max Limit (%)</Label>
                                <Input 
                                    type="number"
                                    value={formData.discount_limit}
                                    onChange={(e) => handleChange('discount_limit', e.target.value)}
                                    className={`bg-slate-950 border-slate-700 ${errors.discount_limit ? 'border-red-500' : ''}`}
                                    placeholder="Max %"
                                />
                            </div>
                         )}
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

export default SalesAndTaxTab;