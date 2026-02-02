import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { settingsService } from '@/services/SettingsService';
import { useAuth } from '@/contexts/AuthContext';

const PrivacySettings = () => {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [exportFormat, setExportFormat] = useState('json');
    const [isExporting, setIsExporting] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await settingsService.exportUserData(user.id, exportFormat);
            // Create a blob and download
            const blob = new Blob([result.content], { type: result.type });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            a.click();
            window.URL.revokeObjectURL(url);
            toast({ title: "Export Complete", description: "Your data has been downloaded." });
        } catch (error) {
            toast({ variant: "destructive", title: "Export Failed", description: error.message });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await settingsService.deleteUserAccount(user.id, deletePassword);
            toast({ title: "Account Deleted", description: "We're sorry to see you go." });
            await logout();
        } catch (error) {
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Download a copy of your personal data.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-end gap-4">
                    <div className="space-y-2 flex-1 max-w-xs">
                        <Label>Export Format</Label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger className="bg-slate-950 border-slate-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="json">JSON (Machine Readable)</SelectItem>
                                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleExport} disabled={isExporting} variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download Archive
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-red-900/30 bg-red-950/10">
                <CardHeader>
                    <CardTitle className="text-red-500 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-400/70">
                        Irreversible actions related to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-white">Delete Account</h4>
                            <p className="text-sm text-slate-400">Permanently remove your account and all data.</p>
                        </div>
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">Delete Account</Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-950 border-slate-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    <Label>Enter password to confirm</Label>
                                    <Input 
                                        type="password" 
                                        value={deletePassword} 
                                        onChange={e => setDeletePassword(e.target.value)} 
                                        className="bg-slate-900 border-slate-700"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-slate-700 hover:bg-slate-800 text-white">Cancel</Button>
                                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting || !deletePassword}>
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Account
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

             <div className="text-center text-sm text-slate-500 pt-4">
                <p>Read our <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a> regarding GDPR compliance.</p>
            </div>
        </div>
    );
};

export default PrivacySettings;