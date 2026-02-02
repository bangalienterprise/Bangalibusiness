import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import BangaliLogoFull from '@/components/BangaliLogoFull';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setTimeout(() => {
        setSubmitting(false);
        setIsSent(true);
        toast({
            title: "Recovery email sent",
            description: "Check your inbox for instructions.",
        });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="flex justify-center">
            <BangaliLogoFull size="md" />
        </div>

        <Card className="border border-slate-700 bg-[#1e293b] text-white rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="p-8">
            {!isSent ? (
                <>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                        <p className="text-slate-400 text-sm">Enter your email address and we'll send you a recovery link</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg" 
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Recovery Link"}
                        </Button>
                    </form>
                </>
            ) : (
                <div className="text-center py-6">
                    <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        We've sent password reset instructions to <br/><span className="text-white font-medium">{email}</span>
                    </p>
                    <Button 
                        onClick={() => setIsSent(false)} 
                        variant="outline" 
                        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        Try another email
                    </Button>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                <Link to="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;