import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { QrCode, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const MFAEnrollPage = () => {
    const [qrCode, setQrCode] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [factorId, setFactorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { session } = useAuth();
    
    const startEnrollment = useCallback(async () => {
        if (!session) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
        });

        if (error) {
            toast({ title: 'MFA Enrollment Error', description: error.message, variant: 'destructive' });
            if (error.message.includes("Enrolled factors found for user")) {
               // This can happen if user reloads. We should sign them out to restart the flow.
               await supabase.auth.signOut();
               navigate('/login');
            }
            return;
        }
        
        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setEnrolling(false);
    }, [session, navigate, toast]);

    useEffect(() => {
        startEnrollment();
    }, [startEnrollment]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
        if (challengeError) {
            toast({ title: 'MFA Challenge Error', description: challengeError.message, variant: 'destructive' });
            setLoading(false);
            return;
        }

        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.id,
            code: verifyCode,
        });

        if (verifyError) {
            toast({ title: 'Verification Failed', description: verifyError.message, variant: 'destructive' });
        } else {
            toast({ title: 'Account Activated!', description: 'MFA setup is complete. You are now logged in.' });
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Setup 2FA - Bangali Enterprise</title>
                <meta name="description" content="Set up Two-Factor Authentication for your account." />
            </Helmet>
            <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-border p-8 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Secure Your Account</h1>
                    <p className="text-muted-foreground mb-8">Setup Two-Factor Authentication (2FA)</p>
                    
                    {enrolling ? (
                        <p className="text-foreground">Generating QR code...</p>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-200">1. Scan QR Code</Label>
                                <p className="text-sm text-muted-foreground">Scan this with your authenticator app (e.g., Google Authenticator, Authy).</p>
                                <div className="bg-white p-4 rounded-lg inline-block" dangerouslySetInnerHTML={{ __html: qrCode }}></div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="verifyCode" className="text-slate-200">2. Enter Verification Code</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="verifyCode"
                                        placeholder="6-digit code"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value)}
                                        className="bg-input border-border text-white text-center tracking-widest text-lg pl-10"
                                        required
                                        maxLength="6"
                                    />
                                </div>
                            </div>
                            
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg mt-4" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Activate Account'}
                            </Button>
                        </form>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default MFAEnrollPage;