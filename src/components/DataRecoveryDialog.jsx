import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storageManager } from '@/lib/persistentStorage';
import { History, RotateCcw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const DataRecoveryDialog = ({ open, onOpenChange }) => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadBackups();
        }
    }, [open]);

    const loadBackups = async () => {
        try {
            const keys = await storageManager.getBackups();
            setBackups(keys);
        } catch (error) {
            console.error("Failed to load backups:", error);
        }
    };

    const handleRestore = async (key) => {
        if (window.confirm('Are you sure? This will overwrite current data and reload the page.')) {
            setLoading(true);
            try {
                await storageManager.restoreBackup(key);
                window.location.reload();
            } catch (error) {
                console.error("Restore failed:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        try {
            await storageManager.createBackup();
            await loadBackups();
        } catch (error) {
            console.error("Backup failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" /> Data Recovery & Backup
                    </DialogTitle>
                    <DialogDescription>
                        Manage local backups. Restoring will replace current local data.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <Button onClick={handleCreateBackup} disabled={loading} className="w-full mb-4">
                        Create New Backup Now
                    </Button>
                    
                    <h4 className="text-sm font-medium mb-2">Available Backups</h4>
                    <ScrollArea className="h-[200px] rounded-md border p-2">
                        {backups.length > 0 ? (
                            <div className="space-y-2">
                                {backups.map((key) => {
                                    const parts = key.split('_');
                                    const timestamp = parts.length > 1 ? parseInt(parts[1]) : Date.now();
                                    return (
                                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {format(timestamp, 'PPP p')}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">{key}</span>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleRestore(key)}
                                                disabled={loading}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" /> Restore
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <AlertTriangle className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No backups found</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DataRecoveryDialog;