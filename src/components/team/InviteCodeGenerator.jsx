import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, RefreshCw, Trash, Clock } from 'lucide-react';
import { ROLES } from '@/lib/rolePermissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const InviteCodeGenerator = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [codes, setCodes] = useState([]);
    const [role, setRole] = useState(ROLES.SELLER);
    const [loading, setLoading] = useState(false);

    const refreshCodes = async () => {
        if (user) {
            const allCodes = await mockDatabase.getEntities('inviteCodes', user.business_id);
            setCodes(allCodes.filter(c => c.status === 'active'));
        }
    };

    useEffect(() => { refreshCodes(); }, [user]);

    const generateCode = async () => {
        setLoading(true);
        await mockDatabase.generateInviteCode(user.business_id, role, user.id);
        await refreshCodes();
        setLoading(false);
        toast({ title: "Code Generated", description: "Share this code with your team member." });
    };

    const copyCode = (code) => {
        // Copy just the code for easier manual entry
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: "Code copied to clipboard." });
    };
    
    const revokeCode = async (id) => {
        await mockDatabase.updateEntity('inviteCodes', id, { status: 'revoked' });
        refreshCodes();
        toast({ title: "Revoked", description: "Invite code is no longer valid." });
    };

    return (
        <Card className="h-full border-slate-800 bg-slate-900/50">
            <CardHeader>
                <CardTitle>Invite Codes</CardTitle>
                <CardDescription>Generate codes for new team members to join.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2 items-end">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium text-slate-300">Role Assignment</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="bg-slate-950 border-slate-700">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                                <SelectItem value={ROLES.SELLER}>Seller</SelectItem>
                                {/* Freelancer/Service businesses might call them Staff/Technician but underlying role is Seller/Employee */}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={generateCode} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><RefreshCw className="mr-2 h-4 w-4"/> Generate</>}
                    </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {codes.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No active codes</p>}
                    {codes.map(code => (
                        <div key={code.code} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xl font-bold tracking-wider text-white">{code.code}</span>
                                    <Badge variant="secondary" className="text-[10px] uppercase">{code.role}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    Expires: {new Date(code.expires_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => copyCode(code.code)} className="h-8 w-8 hover:bg-slate-800">
                                    <Copy className="h-4 w-4 text-slate-400" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => revokeCode(code.id)} className="h-8 w-8 hover:bg-red-900/20 hover:text-red-400">
                                    <Trash className="h-4 w-4 text-slate-600" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default InviteCodeGenerator;