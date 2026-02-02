import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { apiClient } from '@/services/apiClient';
import { Mail } from 'lucide-react';

const userSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  role: z.string().min(1, { message: "Please select a role." }),
  manager_id: z.string().nullable().optional(),
});

const editUserSchema = userSchema.omit({ email: true });

const UserDialog = ({ isOpen, setIsOpen, user, onSuccess }) => {
  const { toast } = useToast();
  const { profile: currentUserProfile } = useAuth();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(isEditing ? editUserSchema : userSchema),
    defaultValues: { email: '', fullName: '', username: '', role: '', manager_id: null }
  });

  const watchRole = watch('role');

  useEffect(() => {
    if (isOpen) {
      if (isEditing && user) {
        reset({
          fullName: user.full_name || '',
          username: user.username || '',
          role: user.role || '',
          manager_id: user.manager_id || null,
        });
      } else {
        reset({ email: '', fullName: '', username: '', role: 'seller', manager_id: null });
      }
    }
  }, [user, isEditing, isOpen, reset]);

  const onSubmit = async (data) => {
      setLoading(true);
      try {
          if (isEditing) {
              await apiClient.put(`/profiles/${user.id}`, {
                  full_name: data.fullName,
                  username: data.username,
                  role: data.role
              });
              toast({ title: 'User Updated' });
          } else {
              // Simulate create
               await apiClient.post(`/profiles`, {
                  email: data.email,
                  full_name: data.fullName,
                  username: data.username,
                  role: data.role,
                  business_id: business?.id,
                  status: 'active'
              });
              toast({ title: 'User Created' });
          }
          onSuccess();
          setIsOpen(false);
      } catch (e) {
          toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
          setLoading(false);
      }
  };
  
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
             {!isEditing && (
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input {...register('email')} />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
             )}
             <div className="space-y-1">
                <Label>Full Name</Label>
                <Input {...register('fullName')} />
             </div>
             <div className="space-y-1">
                <Label>Username</Label>
                <Input {...register('username')} />
             </div>
             <div className="space-y-1">
                <Label>Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
             </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;