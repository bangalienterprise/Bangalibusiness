import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { TeamService } from '@/lib/services/TeamService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CONFIGURABLE_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_RISK_LEVELS,
  formatPermissionName
} from '@/lib/rolePermissions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const EditPermissionsDialog = ({ open, onOpenChange, member, businessId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      permissions: member.permissions || []
    }
  });

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        permissions: Array.isArray(member.permissions) ? member.permissions : []
      });
    }
  }, [member, form]);

  const watchPermissions = form.watch("permissions");

  const handleSelectAll = () => {
    form.setValue('permissions', CONFIGURABLE_PERMISSIONS);
  };

  const handleClearAll = () => {
    form.setValue('permissions', []);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (values.permissions.length === 0) {
        // Warning or allow? Allowed in system, but maybe warn.
      }

      await TeamService.updateMemberPermissions(businessId, member.user_id, values.permissions);

      toast({
        title: "Permissions Updated",
        description: `Permissions for ${member.profile?.full_name} have been updated.`,
      });

      if (onUpdate) onUpdate();
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Permissions</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure access control for <b>{member?.profile?.full_name}</b> ({member?.role}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-base font-semibold flex items-center gap-2 text-white">
                Active Permissions <span className="text-xs font-normal text-slate-400">({watchPermissions.length} selected)</span>
              </Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="xs" onClick={handleSelectAll} className="h-7 text-xs border-slate-600 hover:bg-slate-800">Select All</Button>
                <Button type="button" variant="ghost" size="xs" onClick={handleClearAll} className="h-7 text-xs text-slate-400 hover:text-white">Clear</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                          isChecked ? "bg-slate-800 border-primary/30" : "bg-slate-950/30 border-slate-800",
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
                              <Label className="cursor-pointer font-medium text-sm text-slate-200">{formatPermissionName(perm)}</Label>
                              {risk === 'high' && (
                                <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase">High Risk</Badge>
                              )}
                              {risk === 'medium' && (
                                <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase border-yellow-500 text-yellow-500">Sensitive</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-tight">{PERMISSION_DESCRIPTIONS[perm]}</p>
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
                Warning: You are granting high-risk permissions.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Permissions
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPermissionsDialog;