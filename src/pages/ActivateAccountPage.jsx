import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ActivateAccountPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) {
            setError('No activation token found. Please use the link from your email.');
            return;
        }

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const type = params.get('type');

        if (type !== 'recovery' && type !== 'invite') {
            setError('Invalid activation link type.');
            return;
        }

        if (!accessToken) {
            setError('Invalid or missing activation token.');
            return;
        }

        const setSession = async () => {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: params.get('refresh_token') || '',
            });
            if (sessionError) {
                setError(`Failed to authenticate: ${sessionError.message}`);
                toast({ title: 'Authentication Error', description: sessionError.message, variant: 'destructive' });
            } else {
                setIsReady(true);
            }
        };
        
        setSession();
    }, [toast]);

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
            toast({ title: 'Error Setting Password', description: updateError.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success!', description: 'Your password has been set. You will be redirected to login.' });
            await supabase.auth.signOut();
            navigate('/login');
        }
        setLoading(false);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md text-center bg-card p-8 rounded-lg shadow-lg"
                >
                    <h1 className="text-2xl font-bold text-destructive mb-4">Activation Failed</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={() => navigate('/login')} className="mt-6">Back to Login</Button>
                </motion.div>
            </div>
        );
    }
    
    if (!isReady) {
         return <div className="flex h-screen items-center justify-center"><div>Verifying activation link...</div></div>;
    }

    return (
        <>
            <Helmet>
                <title>Activate Account - Bangali Enterprise</title>
                <meta name="description" content="Activate your account by setting a new password." />
            </Helmet>
            <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="glassmorphic rounded-2xl shadow-2xl p-8">
                        <h1 className="text-2xl font-bold text-center text-foreground mb-2">Activate Your Account</h1>
                        <p className="text-center text-muted-foreground mb-6">Welcome! Please set your password to continue.</p>
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter a strong password"
                                    required
                                    className="bg-input"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Saving...' : 'Set Password and Login'}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default ActivateAccountPage;