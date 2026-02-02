import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, Copy, Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { TeamService } from '@/lib/services/TeamService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    CONFIGURABLE_PERMISSIONS, 
    PERMISSION_DESCRIPTIONS, 
    ROLES, 
    PERMISSIONS,
    PERMISSION_RISK_LEVELS
} from '@/lib/rolePermissions';
import { formatPermissionName } from '@/utils/permissionUtils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2, "Name is too short"),
  role: z.enum([ROLES.MANAGER, ROLES.SELLER], { required_error: "Please select a role" }),
  permissions: z.array(z.string())
});

const InviteTeamMemberForm = ({ businessId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      role: ROLES.SELLER,
      permissions: [PERMISSIONS.CAN_SELL, PERMISSIONS.CAN_VIEW_ORDERS]
    }
  });

  const watchRole = form.watch("role");
  const watchPermissions = form.watch("permissions");

  const handleSelectAll = () => {
      form.setValue('permissions', CONFIGURABLE_PERMISSIONS);
  };
  
  const handleClearAll = () => {
      form.setValue('permissions', []);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    setInviteLink(null);
    try {
      if (values.role === ROLES.MANAGER && values.permissions.length === 0) {
          throw new Error("Managers must have at least one permission assigned.");
      }

      const result = await TeamService.inviteMember({
        businessId,
        email: values.email,
        name: values.name,
        role: values.role,
        permissions: values.permissions,
        invitedBy: user.id
      });
      
      toast({
        title: "Invitation Created",
        description: `Invite created for ${values.email}.`,
      });
      
      setInviteLink(result.inviteLink);
      form.reset({
          email: "",
          name: "",
          role: ROLES.SELLER,
          permissions: [PERMISSIONS.CAN_SELL, PERMISSIONS.CAN_VIEW_ORDERS]
      });
      if (onSuccess) onSuccess();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: "Copied!", description: "Invite link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="mb-6 border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-xl">Invite Team Member</CardTitle>
        <CardDescription>Configure access and permissions for new members.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" {...field} />
                    {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" placeholder="colleague@example.com" className="pl-9" {...field} />
                    </div>
                    {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                  </div>
                )}
              />
          </div>
            
          <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                        <SelectItem value={ROLES.SELLER}>Seller</SelectItem>
                      </SelectContent>
                  </Select>
                )}
              />
          </div>

          {watchRole === ROLES.MANAGER && (
            <div className="space-y-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                     <Label className="text-base font-semibold flex items-center gap-2">
                         Permissions <span className="text-xs font-normal text-muted-foreground">({watchPermissions.length} selected)</span>
                     </Label>
                     <div className="flex gap-2">
                         <Button type="button" variant="outline" size="xs" onClick={handleSelectAll}>Select All</Button>
                         <Button type="button" variant="ghost" size="xs" onClick={handleClearAll}>Clear</Button>
                     </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {CONFIGURABLE_PERMISSIONS.map(perm => {
                        const risk = PERMISSION_RISK_LEVELS[perm];
                        return (
                        <Controller
                            key={perm}
                            control={form.control}
                            name="permissions"
                            render={({ field }) => {
                                const isChecked = field.value.includes(perm);
                                return (
                                    <div className={cn(
                                        "flex items-start space-x-3 p-3 rounded-lg border transition-all",
                                        isChecked ? "bg-slate-800 border-primary/30" : "bg-slate-900/50 border-slate-800",
                                        risk === 'high' && isChecked ? "border-red-500/30 bg-red-950/10" : ""
                                    )}>
                                        <Switch
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                if (checked) field.onChange([...field.value, perm]);
                                                else field.onChange(field.value.filter(p => p !== perm));
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1">
                                            <div className="flex items-center gap-2">
                                                <Label className="cursor-pointer font-medium text-sm">{formatPermissionName(perm)}</Label>
                                                {risk === 'high' && (
                                                    <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase">High Risk</Badge>
                                                )}
                                                {risk === 'medium' && (
                                                    <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase border-yellow-500 text-yellow-500">Sensitive</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-tight">{PERMISSION_DESCRIPTIONS[perm]}</p>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        );
                    })}
                </div>
                
                {watchPermissions.some(p => PERMISSION_RISK_LEVELS[p] === 'high') && (
                    <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/30 rounded text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Warning: You are granting high-risk permissions to this user.
                    </div>
                )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invitation"}
          </Button>
        </form>

        {inviteLink && (
          <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-sm text-muted-foreground mb-2">Share this link:</p>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="bg-slate-950 font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteTeamMemberForm;