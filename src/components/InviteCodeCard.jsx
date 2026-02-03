import React, { useState } from 'react';
import { Copy, Calendar, Users, XCircle, Share2, Check, AlertTriangle, ShieldCheck, QrCode, Link as LinkIcon, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { inviteService } from '@/services/inviteService';

const InviteCodeCard = ({ codeData, onRevoke }) => {
    const { toast } = useToast();
    const [isRevoking, setIsRevoking] = useState(false);
    const [status, setStatus] = useState(codeData.status);

    const isExpired = new Date(codeData.expiresAt) < new Date();
    const effectiveStatus = isExpired ? 'expired' : status;

    const handleCopy = () => {
        navigator.clipboard.writeText(codeData.code);
        toast({
            title: "Copied!",
            description: "Invite code copied to clipboard.",
        });
    };

    const handleShare = (method) => {
        const url = window.location.origin + '/join-existing-business';
        const text = `Join my team on Bangali Enterprise using code: ${codeData.code}`;

        if (method === 'copy_link') {
            navigator.clipboard.writeText(url);
            toast({ title: "Link Copied", description: "Join page link copied to clipboard." });
        } else if (method === 'email') {
            window.open(`mailto:?subject=Join%20my%20Team&body=${encodeURIComponent(text + '\n' + url)}`);
        } else if (method === 'native') {
            if (navigator.share) {
                navigator.share({ title: 'Join Team', text: text, url: url }).catch(console.error);
            } else {
                handleCopy();
            }
        }
    };

    const handleRevoke = async () => {
        setIsRevoking(true);
        try {
            await inviteService.revokeInviteCode(codeData.code);
            setStatus('revoked');
            if (onRevoke) onRevoke(codeData.code);
            toast({ title: "Code Revoked", description: "This code can no longer be used." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to revoke code." });
        } finally {
            setIsRevoking(false);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'revoked': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'expired': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Invite Code</span>
                        <span className="text-3xl font-mono font-bold text-white tracking-widest">{codeData.code}</span>
                    </div>
                    <Badge variant="outline" className={`uppercase text-[10px] h-6 px-2.5 ${getStatusColor(effectiveStatus)}`}>
                        {effectiveStatus}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-400 mb-6 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-blue-400" />
                        <span><span className="text-white font-medium">{codeData.usedCount}</span> / {codeData.maxUses || '∞'} used</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                        <span className="capitalize text-white font-medium">{codeData.role}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>Expires: {new Date(codeData.expiresAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 text-white transition-colors" onClick={handleCopy}>
                        <Copy className="h-3.5 w-3.5 mr-2" /> Copy
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 text-white transition-colors">
                                <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white">
                            <DropdownMenuItem onClick={() => handleShare('native')}>
                                <Share2 className="mr-2 h-4 w-4" /> Default Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare('email')}>
                                <Mail className="mr-2 h-4 w-4" /> Email Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare('copy_link')}>
                                <LinkIcon className="mr-2 h-4 w-4" /> Copy Join Link
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {effectiveStatus === 'active' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-9 shrink-0">
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Revoke Invite Code?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        This will permanently deactivate code <strong>{codeData.code}</strong>. Users will no longer be able to join using this code. Existing users are not affected.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRevoke} className="bg-red-600 hover:bg-red-700 text-white border-0">Revoke Code</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default InviteCodeCard;