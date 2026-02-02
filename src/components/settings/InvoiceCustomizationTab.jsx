import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/contexts/SettingsContext';
import { validateInvoicePrefix } from '@/utils/settingsValidator';
import { FileText, Eye } from 'lucide-react';
import ReceiptPrinter from '@/components/sales/ReceiptPrinter';

const InvoiceCustomizationTab = () => {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState({});
    const [previewOpen, setPreviewOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (settings?.invoice) {
            setFormData(settings.invoice);
        }
    }, [settings]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const prefixErr = validateInvoicePrefix(formData.invoice_prefix);
        if (prefixErr) {
            setErrors({ invoice_prefix: prefixErr });
            return;
        }

        setSaving(true);
        try {
            await updateSettings({ ...settings, invoice: formData });
        } finally {
            setSaving(false);
        }
    };

    const tempSettings = { ...settings, invoice: formData };

    return (
        <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-500" /> Invoice Customization
                    </CardTitle>
                    <CardDescription>Customize the look and feel of your receipts.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="border-slate-700">
                    <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Header Text</Label>
                            <Textarea 
                                value={formData.header_text}
                                onChange={(e) => handleChange('header_text', e.target.value)}
                                className="bg-slate-950 border-slate-700 min-h-[80px]"
                                placeholder="e.g., Thank you for shopping!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Footer Text</Label>
                            <Textarea 
                                value={formData.footer_text}
                                onChange={(e) => handleChange('footer_text', e.target.value)}
                                className="bg-slate-950 border-slate-700 min-h-[80px]"
                                placeholder="e.g., Return Policy details..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label>Paper Size</Label>
                            <Select value={formData.paper_size} onValueChange={(v) => handleChange('paper_size', v)}>
                                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="Thermal">Thermal (80mm)</SelectItem>
                                    <SelectItem value="A4">A4 Standard</SelectItem>
                                    <SelectItem value="A5">A5 Small</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Invoice Prefix</Label>
                                <Input 
                                    value={formData.invoice_prefix}
                                    onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                                    className={`bg-slate-950 border-slate-700 ${errors.invoice_prefix ? 'border-red-500' : ''}`}
                                />
                                {errors.invoice_prefix && <p className="text-xs text-red-500">{errors.invoice_prefix}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Start Number</Label>
                                <Input 
                                    type="number"
                                    value={formData.invoice_start}
                                    onChange={(e) => handleChange('invoice_start', e.target.value)}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                        <Label>Show Logo</Label>
                        <Switch checked={formData.show_logo} onCheckedChange={(c) => handleChange('show_logo', c)} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Label>Show Address</Label>
                        <Switch checked={formData.show_address} onCheckedChange={(c) => handleChange('show_address', c)} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Label>Show Phone</Label>
                        <Switch checked={formData.show_phone} onCheckedChange={(c) => handleChange('show_phone', c)} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <Label>Show Email</Label>
                        <Switch checked={formData.show_email} onCheckedChange={(c) => handleChange('show_email', c)} />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <ReceiptPrinter 
                    open={previewOpen} 
                    onClose={() => setPreviewOpen(false)} 
                    settings={tempSettings}
                    transaction={null}
                />
            </CardContent>
        </Card>
    );
};

export default InvoiceCustomizationTab;