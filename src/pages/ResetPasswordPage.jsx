import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { validatePassword, validatePasswordMatch } from '@/lib/formValidation';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If not authenticated, the user likely didn't click the link correctly or session expired
    // However, Supabase magic link logs them in first.
    // If user is NOT authenticated, we should probably redirect or show an error.
    // But since `onAuthStateChange` might take a moment, we wait a bit or check loading state (handled by parent route ideally)
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      toast({ title: "Weak Password", description: passCheck.error, variant: "destructive" });
      return;
    }
    
    const matchCheck = validatePasswordMatch(password, confirmPassword);
    if (!matchCheck.isValid) {
      toast({ title: "Mismatch", description: matchCheck.error, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully. Redirecting to login...",
        className: "bg-green-50 border-green-200 text-green-900"
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - Bangali Enterprise</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-800">
            <h1 className="text-2xl font-bold text-center text-white mb-2">Reset Password</h1>
            <p className="text-center text-gray-400 mb-6">Create a new secure password.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                        required
                    />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : 'Reset Password'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;