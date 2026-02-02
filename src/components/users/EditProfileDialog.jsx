import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/services/apiClient';

const EditProfileDialog = ({ isOpen, setIsOpen, user, onProfileUpdate }) => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { success, error } = await apiClient.put(`/profiles/${user.id}`, { full_name: fullName });

    if (!success) {
        toast({ title: 'Update Failed', description: error, variant: 'destructive' });
    } else {
        toast({ title: 'Profile Updated!' });
        if(onProfileUpdate) onProfileUpdate();
        setIsOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;