import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Shield, UserX, UserCheck, Trash2, Check, ShieldCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { TeamService } from '@/lib/services/TeamService';
import { format } from 'date-fns';
import EditPermissionsDialog from './EditPermissionsDialog';

const TeamMemberRow = ({ member, businessId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const { toast } = useToast();

  const isOwner = member.role === 'owner';
  const isActive = member.status === 'active';

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  const roleColors = {
    owner: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    manager: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    seller: 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  const statusColors = {
    active: 'bg-green-500/10 text-green-500',
    invited: 'bg-yellow-500/10 text-yellow-500',
    inactive: 'bg-slate-500/10 text-slate-500',
  };

  const handleRoleChange = async (newRole) => {
    if (newRole === member.role) return;
    setLoading(true);
    try {
      await TeamService.updateMemberRole(businessId, member.user_id, newRole);
      toast({ title: "Role Updated", description: `Member role changed to ${newRole}.` });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setLoading(true);
    try {
      if (isActive) {
        await TeamService.deactivateMember(businessId, member.user_id);
        toast({ title: "Member Deactivated", description: "User can no longer access the dashboard." });
      } else {
        await TeamService.reactivateMember(businessId, member.user_id);
        toast({ title: "Member Reactivated", description: "User access restored." });
      }
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await TeamService.removeMember(businessId, member.user_id);
      toast({ title: "Member Removed", description: "User has been removed from the team." });
      onUpdate();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={member.profile?.avatar_url} />
              <AvatarFallback>{getInitials(member.profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm text-slate-100">{member.profile?.full_name || 'Unknown User'}</span>
              <span className="text-xs text-slate-400">{member.profile?.email}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`${roleColors[member.role] || 'text-slate-500'} capitalize`}>
            {member.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={`${statusColors[member.status] || 'text-slate-500'} capitalize`}>
            {member.status}
          </Badge>
        </TableCell>
        <TableCell className="text-slate-400 text-sm">
          {member.created_at ? format(new Date(member.created_at), 'MMM d, yyyy') : '-'}
        </TableCell>
        <TableCell className="text-right">
          {!isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loading}>
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-slate-200">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="hover:bg-slate-700">
                    <Shield className="mr-2 h-4 w-4" /> Change Role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleRoleChange('manager')} className="hover:bg-slate-700">
                        <span className="flex-1">Manager</span>
                        {member.role === 'manager' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange('seller')} className="hover:bg-slate-700">
                        <span className="flex-1">Seller</span>
                        {member.role === 'seller' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={() => setShowPermissionsDialog(true)} className="hover:bg-slate-700">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Edit Permissions
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleStatusToggle} className="hover:bg-slate-700">
                  {isActive ? (
                    <>
                      <UserX className="mr-2 h-4 w-4 text-orange-500" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                      <span>Reactivate</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-400 focus:text-red-400 focus:bg-red-950/20 hover:bg-slate-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Remove Member</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to remove <b>{member.profile?.full_name}</b>? They will lose access to this business immediately. This action cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPermissionsDialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
        member={member}
        businessId={businessId}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default TeamMemberRow;