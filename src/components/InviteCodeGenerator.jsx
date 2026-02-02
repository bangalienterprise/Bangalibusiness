import React, { useState } from 'react';
import { Plus, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { ROLES } from '@/lib/rolePermissions';

const InviteCodeGenerator = ({ onCodeGenerated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('staff');
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const newCode = await mockDatabase.createInviteCode(user.business_id, user.id, role);
        setGeneratedCode(newCode);
        if (onCodeGenerated) onCodeGenerated(newCode);
        toast({ title: "Code Generated", description: "New invite code is ready to share." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to generate code." });
    } finally {
        setLoading(false);
    }
  };

  const handleClose = () => {
      setIsOpen(false);
      setGeneratedCode(null);
      setRole('staff');
  };
  
  const copyToClipboard = () => {
      if (generatedCode) {
          navigator.clipboard.writeText(generatedCode.code);
          toast({ title: "Copied!", description: "Code copied to clipboard" });
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-500">
                <Plus className="h-4 w-4 mr-2" /> Generate Invite Code
            </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Generate New Invite Code</DialogTitle>
                <DialogDescription className="text-slate-400">
                    Create a code to invite new members to your team. Codes expire in 30 days.
                </DialogDescription>
            </DialogHeader>
            
            {!generatedCode ? (
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm text-slate-300">Role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3 bg-slate-950 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="seller">Seller</SelectItem>
                                {user?.business_type === 'education' && <SelectItem value="teacher">Teacher</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ) : (
                <div className="py-6 flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
                        <Check className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-mono font-bold text-white tracking-widest">{generatedCode.code}</h3>
                        <p className="text-sm text-slate-400 mt-2">Role: <span className="text-white capitalize">{generatedCode.role}</span></p>
                    </div>
                    <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 mt-4" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                    </Button>
                </div>
            )}

            <DialogFooter className="sm:justify-between">
                {!generatedCode ? (
                    <>
                        <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-white">Cancel</Button>
                        <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Generate Code
                        </Button>
                    </>
                ) : (
                    <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handleClose}>
                        Done
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

export default InviteCodeGenerator;