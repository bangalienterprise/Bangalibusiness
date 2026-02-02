
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import BangaliLogoFull from '@/components/BangaliLogoFull';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
             toast({ variant: "destructive", title: "Error", description: "Please enter both email and password." });
             return;
        }

        setLoading(true);
        try {
            const { profile } = await login(email, password);
            toast({ title: "Welcome back!", description: "Successfully logged in." });
            
            if (profile?.role === 'global_admin') {
                navigate('/admin');
            } else {
                navigate('/retail/dashboard');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <BangaliLogoFull size="lg" />
                    <h1 className="text-3xl font-bold tracking-tight text-white mt-4">Welcome back</h1>
                    <p className="text-slate-400">Sign in to your account</p>
                </div>
                <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-200">Email</Label>
                                <Input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="bg-slate-900/50 border-slate-600 text-white focus:border-[#16a34a] focus:ring-[#16a34a]" 
                                    placeholder="name@example.com" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-200">Password</Label>
                                    <Link to="/forgot-password" className="text-xs text-[#16a34a] hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="bg-slate-900/50 border-slate-600 text-white pr-10 focus:border-[#16a34a] focus:ring-[#16a34a]" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-3 top-3 text-slate-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold" 
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                    <div className="bg-slate-900/50 p-4 text-center border-t border-slate-700">
                         <p className="text-sm text-slate-400">Don't have an account? <Link to="/signup" className="text-[#16a34a] hover:text-[#15803d] font-semibold ml-1">Sign up</Link></p>
                    </div>
                    <div className="bg-slate-900/80 p-3 text-center border-t border-slate-800">
                         <p className="text-xs text-slate-500">© 2026 Bangali Enterprise. All rights reserved.</p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
