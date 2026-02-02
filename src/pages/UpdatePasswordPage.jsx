import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UpdatePasswordPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast({ title: 'Error Updating Password', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success!', description: 'Your password has been updated.' });
            navigate('/dashboard'); // or to profile page
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Update Password - Bangali Enterprise</title>
                <meta name="description" content="Update your account password." />
            </Helmet>
            <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="glassmorphic rounded-2xl shadow-2xl p-8">
                        <h1 className="text-2xl font-bold text-center text-foreground mb-2">Update Your Password</h1>
                        <p className="text-center text-muted-foreground mb-6">Enter a new password for your account.</p>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                    className="bg-input"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default UpdatePasswordPage;