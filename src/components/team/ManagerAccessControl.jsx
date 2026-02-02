import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockDatabase } from '@/lib/services/MockDatabase'; // Fixed import path
import { useToast } from '@/components/ui/use-toast';
import { CONFIGURABLE_PERMISSIONS } from '@/lib/rolePermissions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

const ManagerAccessControl = ({ member, onUpdate }) => {
    const { toast } = useToast();
    const [permissions, setPermissions] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Load initial permissions from member object
        if (member.permissions) {
            setPermissions(member.permissions);
        }
    }, [member]);

    const handleToggle = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await mockDatabase.updateUserPermissions(member.id, permissions);
            toast({ title: "Permissions Updated", description: `Access rights for ${member.full_name} updated.` });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update permissions." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 mt-2">
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="font-semibold text-white">Access Control for {member.full_name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CONFIGURABLE_PERMISSIONS.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between space-x-2">
                            <Label htmlFor={`${perm.id}-${member.id}`} className="flex flex-col space-y-1 cursor-pointer">
                                <span>{perm.label}</span>
                            </Label>
                            <Switch 
                                id={`${perm.id}-${member.id}`} 
                                checked={permissions[perm.id] || false}
                                onCheckedChange={() => handleToggle(perm.id)}
                            />
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end pt-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button size="sm" className="bg-blue-600 hover:bg-blue-500" disabled={isSaving}>Save Changes</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Permission Changes</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to update access rights for {member.full_name}? These changes will take effect immediately.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">Confirm Save</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManagerAccessControl;