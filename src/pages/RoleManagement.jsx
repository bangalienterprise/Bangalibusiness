import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  Shield, PlusCircle, MoreHorizontal, Edit, Trash2, Save, X, Search, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { permissionCategories } from '@/lib/permissions';
import { useAuth } from '@/contexts/SupabaseAuthContext';


const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const canManageRoles = hasPermission('manage_roles');

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('roles').select('*');
        if (error) {
            toast({ title: "Error fetching roles", description: error.message, variant: "destructive" });
        } else {
            setRoles(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleCreate = () => {
        if (!canManageRoles) {
            toast({ title: "Permission Denied", description: "You do not have permission to create roles.", variant: "destructive" });
            return;
        }
        setSelectedRole(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (role) => {
        if (!canManageRoles) {
            toast({ title: "Permission Denied", description: "You do not have permission to edit roles.", variant: "destructive" });
            return;
        }
        setSelectedRole(role);
        setIsDialogOpen(true);
    };

    const handleDelete = async (roleName) => {
        if (!canManageRoles) {
            toast({ title: "Permission Denied", description: "You do not have permission to delete roles.", variant: "destructive" });
            return;
        }
        if (['owner', 'admin', 'manager', 'seller'].includes(roleName)) {
            toast({ title: "Action Denied", description: "Cannot delete core system roles.", variant: "destructive" });
            return;
        }
        const { error } = await supabase.from('roles').delete().eq('role_name', roleName);
        if (error) {
            toast({ title: "Error deleting role", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Role deleted successfully" });
            fetchRoles();
        }
    };

    const filteredRoles = roles.filter(role =>
        role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Helmet>
                <title>Role Management - Bangali Enterprise</title>
                <meta name="description" content="Manage user roles and permissions." />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Role Management</h1>
                        <p className="text-muted-foreground">Define roles and assign permissions for your team.</p>
                    </div>
                    {canManageRoles && <Button onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" />Create Role</Button>}
                </div>
                
                <Card>
                    <CardHeader>
                         <CardTitle>All Roles</CardTitle>
                        <CardDescription>View and manage all roles within your business.</CardDescription>
                        <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-muted-foreground border-b">
                                        <th className="p-4">Role Name</th>
                                        <th className="p-4">Permissions Count</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" className="text-center p-8 text-muted-foreground">Loading roles...</td></tr>
                                    ) : filteredRoles.length > 0 ? filteredRoles.map(role => (
                                        <tr key={role.role_name} className="border-b last:border-b-0 hover:bg-muted/50">
                                            <td className="p-4 font-semibold capitalize">{role.role_name.replace(/_/g, ' ')}</td>
                                            <td className="p-4">
                                                <span className="bg-primary/20 text-primary font-bold py-1 px-2 rounded-full text-xs">
                                                    {role.permissions?.length || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(role)} disabled={!canManageRoles}><Edit className="mr-2 h-4 w-4" />Edit Permissions</DropdownMenuItem>
                                                        {!['owner', 'admin', 'manager', 'seller'].includes(role.role_name) && (
                                                            <DropdownMenuItem onClick={() => handleDelete(role.role_name)} disabled={!canManageRoles} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="text-center p-8 text-muted-foreground">No roles found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            
            <RoleDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                role={selectedRole}
                onSuccess={fetchRoles}
                canManage={canManageRoles}
            />
        </>
    );
};

const RoleDialog = ({ isOpen, setIsOpen, role, onSuccess, canManage }) => {
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const { toast } = useToast();
    const isEditing = !!role;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setRoleName(role.role_name);
                setPermissions(role.permissions || []);
            } else {
                setRoleName('');
                setPermissions([]);
            }
            // By default, expand all categories
            const allCategories = Object.keys(permissionCategories).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setExpandedCategories(allCategories);
        }
    }, [isOpen, role, isEditing]);

    const handlePermissionToggle = (permissionId) => {
        setPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleCategory = (categoryKey) => {
        setExpandedCategories(prev => ({...prev, [categoryKey]: !prev[categoryKey]}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!canManage) {
            toast({title: "Permission Denied", description: "You do not have permission to create or modify roles.", variant: "destructive"});
            return;
        }

        if (!roleName) {
            toast({ title: "Role name is required", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        
        const payload = {
            role_name: isEditing ? role.role_name : roleName.toLowerCase().replace(/ /g, '_').trim(),
            permissions: permissions
        };
        
        let query;
        if (isEditing) {
            query = supabase.from('roles').update({ permissions }).eq('role_name', role.role_name);
        } else {
            query = supabase.from('roles').insert(payload);
        }
        
        const { error } = await query;

        if (error) {
            toast({ title: `Error ${isEditing ? 'updating' : 'creating'} role`, description: error.message, variant: "destructive" });
        } else {
            toast({ title: `Role successfully ${isEditing ? 'updated' : 'created'}!` });
            onSuccess();
            setIsOpen(false);
        }
        setIsSaving(false);
    };
    
    const isRoleNameDisabled = isEditing;
    const arePermissionsDisabled = role?.role_name === 'owner' || !canManage;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Edit Role: ${role.role_name.replace(/_/g, ' ')}` : 'Create New Role'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Modify permissions for this role.` : "Define a new role and its permissions."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                            id="role-name"
                            value={roleName}
                            onChange={e => setRoleName(e.target.value)}
                            placeholder="e.g., Marketing Team"
                            disabled={isRoleNameDisabled}
                        />
                         {isRoleNameDisabled && <p className="text-xs text-muted-foreground">Core role names cannot be changed.</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <ScrollArea className="h-72 w-full rounded-md border p-4">
                           <div className="space-y-4">
                                {Object.entries(permissionCategories).map(([key, category]) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleCategory(key)}>
                                            <h4 className="font-semibold">{category.label}</h4>
                                            {expandedCategories[key] ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                                        </div>
                                        {expandedCategories[key] && (
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 ml-2">
                                                {category.permissions.map(permission => (
                                                    <div key={permission.id} className="flex items-start space-x-2">
                                                        <Checkbox
                                                            id={permission.id}
                                                            checked={permissions.includes(permission.id)}
                                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                            disabled={arePermissionsDisabled}
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <label htmlFor={permission.id} className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                {permission.label}
                                                            </label>
                                                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                           </div>
                                        )}
                                    </div>
                                ))}
                           </div>
                        </ScrollArea>
                        {arePermissionsDisabled && !canManage && <p className="text-xs text-destructive">You do not have permission to modify permissions.</p>}
                        {role?.role_name === 'owner' && <p className="text-xs text-muted-foreground">The owner role has all permissions by default and cannot be changed.</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving || !canManage || role?.role_name === 'owner'}>
                            {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4"/>Save Changes</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default RoleManagement;