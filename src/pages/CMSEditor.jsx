import React from 'react';
import { Helmet } from 'react-helmet';
import { Save, Image as ImageIcon, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const CMSEditor = () => {
    const { toast } = useToast();

    const handleSave = (e) => {
        e.preventDefault();
        toast({ title: "Changes Saved", description: "Website content updated successfully." });
    };

    return (
        <div className="space-y-6">
            <Helmet><title>CMS Editor - Global Admin</title></Helmet>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Website CMS</h1>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hero Section */}
                <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" /> Landing Hero</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Main Headline</label>
                            <Input defaultValue="Empower Your Business" className="bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Subheadline</label>
                            <Textarea defaultValue="All-in-one platform for Retail, Agency, and Education management." className="bg-slate-900 border-slate-700 h-20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">CTA Button Text</label>
                            <Input defaultValue="Get Started Free" className="bg-slate-900 border-slate-700" />
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Panel (Mock) */}
                <Card className="bg-white text-slate-900 overflow-hidden">
                    <div className="p-8 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-full flex flex-col justify-center items-center">
                        <h2 className="text-3xl font-bold mb-2">Empower Your Business</h2>
                        <p className="text-blue-100 mb-6 max-w-sm">All-in-one platform for Retail, Agency, and Education management.</p>
                        <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">Get Started Free</Button>
                    </div>
                </Card>
            </div>
            
            <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Feature Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400 italic">Advanced feature editing coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default CMSEditor;