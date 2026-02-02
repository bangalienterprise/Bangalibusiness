import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Edit2, DollarSign, Percent } from 'lucide-react';

const UserCommissionSetup = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({});

    const loadUsers = async () => {
        setLoading(true);
        try {
            const team = await mockDatabase.getTeamMembers(user.business_id);
            // Filter to only managers and sellers usually, but owner can set for anyone
            setUsers(team); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [user]);

    const handleEdit = (u) => {
        setEditingUser(u);
        setFormData({
            commission_percentage: u.commission_percentage || 0,
            commission_type: u.commission_type || 'percentage',
            commission_amount: u.commission_amount || 0,
            is_active_commission: u.is_active_commission ?? true
        });
    };

    const handleSave = async () => {
        try {
            await mockDatabase.updateUserCommission(editingUser.id, formData);
            toast({ title: "Updated", description: "Commission settings updated successfully." });
            setEditingUser(null);
            loadUsers();
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update commission." });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Commission Configuration</h3>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Active Sellers: {users.filter(u => u.role === 'seller' && u.is_active_commission).length}
                </Badge>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">User</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Type</TableHead>
                            <TableHead className="text-slate-400">Rate</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-medium text-white">{u.full_name}</TableCell>
                                <TableCell><Badge variant="secondary" className="bg-slate-800 text-slate-300 capitalize">{u.role}</Badge></TableCell>
                                <TableCell className="text-slate-300 capitalize">{u.commission_type || 'Percentage'}</TableCell>
                                <TableCell className="text-slate-300">
                                    {u.commission_type === 'fixed' ? `৳${u.commission_amount}` : `${u.commission_percentage}%`}
                                </TableCell>
                                <TableCell>
                                    {u.is_active_commission ? 
                                        <Badge className="bg-green-900/20 text-green-400 hover:bg-green-900/20">Active</Badge> : 
                                        <Badge variant="destructive" className="bg-red-900/20 text-red-400 hover:bg-red-900/20">Inactive</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(u)} className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Commission: {editingUser?.full_name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                            <Label>Commission Status</Label>
                            <Switch 
                                checked={formData.is_active_commission}
                                onCheckedChange={(c) => setFormData({...formData, is_active_commission: c})}
                            />
                        </div>
                        
                        <div className="space-y-3 border-t border-slate-800 pt-4">
                            <Label>Commission Type</Label>
                            <Select
                                value={formData.commission_type}
                                onValueChange={(v) => setFormData({...formData, commission_type: v})}
                            >
                                <SelectTrigger className="w-full bg-slate-950 border-slate-700 text-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.commission_type === 'percentage' ? (
                             <div className="space-y-2">
                                <Label>Percentage</Label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input 
                                        type="number" 
                                        value={formData.commission_percentage}
                                        onChange={(e) => setFormData({...formData, commission_percentage: e.target.value})}
                                        className="bg-slate-950 border-slate-700 pl-9" 
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Example: Sale ৳1000 = ৳{(1000 * (formData.commission_percentage || 0) / 100).toFixed(0)} commission</p>
                             </div>
                        ) : (
                             <div className="space-y-2">
                                <Label>Fixed Amount per Sale</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input 
                                        type="number" 
                                        value={formData.commission_amount}
                                        onChange={(e) => setFormData({...formData, commission_amount: e.target.value})}
                                        className="bg-slate-950 border-slate-700 pl-9" 
                                    />
                                </div>
                             </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)} className="border-slate-700 text-white hover:bg-slate-800">Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserCommissionSetup;