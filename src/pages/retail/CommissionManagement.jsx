import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { commissionService } from '@/services/commissionService';
import { teamService } from '@/services/teamService';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';
import { Pencil } from 'lucide-react';

const CommissionManagement = () => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeBusiness]);

    const loadData = async () => {
        if (activeBusiness?.id) {
            const { data, error } = await teamService.getTeamMembers(activeBusiness.id);
            if (!error) {
                setUsers(data || []);
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser({
            id: user.id,
            full_name: user.full_name,
            commission_percentage: user.commission_percentage || 0,
            commission_type: user.commission_type || 'percentage',
            commission_amount: user.commission_amount || 0,
            is_active_commission: user.is_active_commission !== false
        });
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            await commissionService.updateUserCommission(editingUser.id, activeBusiness.id, {
                commission_rate: parseFloat(editingUser.commission_percentage),
                commission_type: editingUser.commission_type
            });
            setOpen(false);
            loadData();
            toast({ title: "Commission updated" });
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800">
                            <TableHead>Staff Member</TableHead>
                            <TableHead>Structure</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={u.id} className="border-slate-800">
                                <TableCell className="font-medium text-white">{u.full_name}</TableCell>
                                <TableCell className="capitalize text-slate-300">{u.commission_type || 'Percentage'}</TableCell>
                                <TableCell className="text-white font-mono">
                                    {u.commission_type === 'fixed' ? `৳${u.commission_amount}` : `${u.commission_percentage}%`}
                                </TableCell>
                                <TableCell>
                                    {u.is_active_commission ? <Badge className="bg-green-500/10 text-green-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" className="h-8 border-slate-700" onClick={() => handleEdit(u)}>
                                        <Pencil className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader><DialogTitle>Edit Commission: {editingUser?.full_name}</DialogTitle></DialogHeader>
                        {editingUser && (
                            <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between">
                                    <Label>Commission Active</Label>
                                    <Switch checked={editingUser.is_active_commission} onCheckedChange={c => setEditingUser({ ...editingUser, is_active_commission: c })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={editingUser.commission_type} onValueChange={v => setEditingUser({ ...editingUser, commission_type: v })}>
                                        <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800">
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount per Sale</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {editingUser.commission_type === 'percentage' ? (
                                    <div className="space-y-2">
                                        <Label>Percentage (%)</Label>
                                        <Input type="number" value={editingUser.commission_percentage} onChange={e => setEditingUser({ ...editingUser, commission_percentage: e.target.value })} className="bg-slate-950 border-slate-700" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Fixed Amount (৳)</Label>
                                        <Input type="number" value={editingUser.commission_amount} onChange={e => setEditingUser({ ...editingUser, commission_amount: e.target.value })} className="bg-slate-950 border-slate-700" />
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-blue-600">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default CommissionManagement;