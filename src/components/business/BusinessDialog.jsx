import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { MENU_CONFIG } from '@/lib/navLinks';
import { Upload, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ id, label, currentImageUrl, onFileSelect, preview, onClear }) => {
    const fileInputRef = useRef(null);

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-md border border-dashed flex items-center justify-center bg-background/50 overflow-hidden">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : currentImageUrl ? (
                        <img src={currentImageUrl} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 space-y-2">
                     <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                    </Button>
                    <Input id={id} ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" onChange={(e) => onFileSelect(e.target.files[0])} />
                    { (preview || currentImageUrl) && 
                        <Button type="button" variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground">
                            Clear
                        </Button>
                    }
                </div>
            </div>
        </div>
    );
};

const BusinessDialog = ({ open, onOpenChange, onSave, business }) => {
    const [name, setName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [iconFile, setIconFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [visibleMenus, setVisibleMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Helper to flatten the complex MENU_CONFIG structure
    const getAllMenuItems = () => {
        const items = [];
        const traverse = (obj) => {
            if (Array.isArray(obj)) {
                items.push(...obj);
            } else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(value => traverse(value));
            }
        };
        traverse(MENU_CONFIG);
        return items;
    };

    const allMenuItems = getAllMenuItems();
    const uniqueMenuItems = Array.from(new Map(allMenuItems.map(item => [item.id, item])).values());

    useEffect(() => {
        if (business) {
            setName(business.name || '');
            setOwnerName(business.owner_name || '');
            setVisibleMenus(business.visible_menus || []);
            setLogoFile(null);
            setIconFile(null);
            setLogoPreview(null);
            setIconPreview(null);
        } else {
            // Reset for new business
            setName('');
            setOwnerName('');
            setVisibleMenus(uniqueMenuItems.map(item => item.id)); // Default to all visible
            setLogoFile(null);
            setIconFile(null);
            setLogoPreview(null);
            setIconPreview(null);
        }
    }, [business, open]);

    const handleFileSelect = (file, type) => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'logo') {
                setLogoFile(file);
                setLogoPreview(previewUrl);
            } else {
                setIconFile(file);
                setIconPreview(previewUrl);
            }
        }
    };
    
    const handleClearImage = (type) => {
        if (type === 'logo') {
            setLogoFile(null);
            setLogoPreview(null);
            if(business) business.logo_url = null; // Mark for removal on save
        } else {
            setIconFile(null);
            setIconPreview(null);
            if(business) business.icon_url = null;
        }
    }

    const handleMenuVisibilityChange = (menuId) => {
        setVisibleMenus(prev => 
            prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
        );
    };

    const handleSave = async () => {
        if (!name || !ownerName) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in both business name and owner name.',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        const businessData = {
            id: business?.id,
            name,
            owner_name: ownerName,
            visible_menus: visibleMenus,
            // URLs will be set in the context function after upload
        };
        await onSave(businessData, logoFile, iconFile);
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isLoading && onOpenChange(isOpen)}>
            <DialogContent className="glassmorphic sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{business ? 'Edit Business' : 'Add New Business'}</DialogTitle>
                    <DialogDescription>
                        {business ? "Update the details and menu visibility for your business." : "Enter the details for the new business."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Business Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Dhaka Electronics" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name</Label>
                        <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="e.g., Jane Doe" />
                    </div>
                    
                    <ImageUpload 
                        id="logo"
                        label="Business Logo"
                        currentImageUrl={business?.logo_url}
                        preview={logoPreview}
                        onFileSelect={(file) => handleFileSelect(file, 'logo')}
                        onClear={() => handleClearImage('logo')}
                    />

                    <ImageUpload 
                        id="icon"
                        label="Business Icon"
                        currentImageUrl={business?.icon_url}
                        preview={iconPreview}
                        onFileSelect={(file) => handleFileSelect(file, 'icon')}
                        onClear={() => handleClearImage('icon')}
                    />

                    <div>
                        <Label className="text-base font-semibold">Visible Menu Sections</Label>
                         <p className="text-sm text-muted-foreground mb-4">Choose which sections are available for this business.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg bg-background/50 p-4 border border-border">
                            {uniqueMenuItems.map(item => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`menu-${item.id}`}
                                        checked={visibleMenus.includes(item.id)}
                                        onCheckedChange={() => handleMenuVisibilityChange(item.id)}
                                    />
                                    <Label htmlFor={`menu-${item.id}`} className="font-normal cursor-pointer flex items-center gap-2">
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Business'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BusinessDialog;