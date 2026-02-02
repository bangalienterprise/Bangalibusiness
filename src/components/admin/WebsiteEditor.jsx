import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye } from 'lucide-react';

const WebsiteEditor = () => {
    const { toast } = useToast();
    const [content, setContent] = useState({
        heroTitle: "Smart Business Solutions for Everyone",
        heroSubtitle: "Manage your retail, service, agency, or education business with one powerful platform.",
        ctaText: "Get Started Free",
        features: []
    });

    useEffect(() => {
        const saved = localStorage.getItem('site_config');
        if (saved) {
            try {
                setContent(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, []);

    const handleChange = (field, value) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('site_config', JSON.stringify(content));
        toast({ title: "Saved", description: "Website configuration updated successfully." });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Homepage Configuration</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="hero" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="hero">Hero Section</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="footer">Footer</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="hero" className="space-y-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="heroTitle">Hero Title</Label>
                            <Input 
                                id="heroTitle" 
                                value={content.heroTitle} 
                                onChange={(e) => handleChange('heroTitle', e.target.value)} 
                            />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                            <Textarea 
                                id="heroSubtitle" 
                                value={content.heroSubtitle} 
                                onChange={(e) => handleChange('heroSubtitle', e.target.value)} 
                            />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="ctaText">Call to Action Text</Label>
                            <Input 
                                id="ctaText" 
                                value={content.ctaText} 
                                onChange={(e) => handleChange('ctaText', e.target.value)} 
                            />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="features">
                        <div className="p-8 text-center border-2 border-dashed rounded-md text-muted-foreground">
                            Feature list management coming soon.
                        </div>
                    </TabsContent>

                    <TabsContent value="footer">
                         <div className="p-8 text-center border-2 border-dashed rounded-md text-muted-foreground">
                            Footer link management coming soon.
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </CardFooter>
        </Card>
    );
};

export default WebsiteEditor;