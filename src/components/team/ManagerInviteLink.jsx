import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check, Link, RefreshCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ManagerInviteLink = () => {
    const { activeBusiness } = useBusiness();
    const { toast } = useToast();
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    const generateLink = () => {
        if (!activeBusiness) return;
        const token = uuidv4();
        // In real app, save token to DB with expiration
        const link = `${window.location.origin}/join-business?invite_token=${token}&business_id=${activeBusiness.id}&role=manager`;
        setInviteLink(link);
        toast({ title: "New Link Generated", description: "This link will expire in 7 days." });
    };

    const copyLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Copied", description: "Link copied to clipboard." });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Quick Manager Invite</CardTitle>
                <CardDescription>Generate a shareable link for managers to join instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input value={inviteLink} placeholder="Click generate to create a link" readOnly />
                    <Button variant="outline" size="icon" onClick={copyLink} disabled={!inviteLink}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="flex justify-end">
                    <Button onClick={generateLink} variant="secondary" size="sm">
                        <RefreshCcw className="mr-2 h-3 w-3" /> Generate New Link
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManagerInviteLink;