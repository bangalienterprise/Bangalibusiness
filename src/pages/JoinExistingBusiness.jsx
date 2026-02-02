import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertTriangle, 
    Building2, ShieldCheck, X, Users, MapPin, Store, Briefcase, GraduationCap, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import BangaliLogoFull from '@/components/BangaliLogoFull';
import { cn } from '@/lib/utils';
import { validateEmail, validatePassword, validateRequired, validatePasswordMatch, calculatePasswordStrength, getPasswordRequirements } from '@/lib/formValidation';
import { validateInviteCodeFormat } from '@/lib/codeGenerator';

const JoinExistingBusiness = () => {
    const navigate = useNavigate();
    const { validateInviteCode, joinBusinessWithCode, isAuthenticated } = useAuth();
    const { toast } = useToast();

    React.useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
    }, [isAuthenticated, navigate]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [businessDetails, setBusinessDetails] = useState(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // --- STEP 1: Verify Code ---
    const handleVerifyCode = async () => {
        setErrors({});
        if (!validateInviteCodeFormat(inviteCode)) {
            setErrors({ inviteCode: "Invalid code format (e.g. ABC-1234)" });
            return;
        }

        setLoading(true);
        try {
            const { business, invite } = await validateInviteCode(inviteCode);
            setBusinessDetails({ ...business, role: invite.role });
            setStep(2);
        } catch (error) {
            setErrors({ inviteCode: error.message });
            toast({
                variant: "destructive",
                title: "Invalid Code",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: Confirm Details ---
    const handleConfirmBusiness = () => {
        setStep(3);
    };

    // --- STEP 3: Register ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        const nameVal = validateRequired(formData.fullName, 'Full Name');
        if (!nameVal.isValid) newErrors.fullName = nameVal.error;

        const emailVal = validateEmail(formData.email);
        if (!emailVal.isValid) newErrors.email = emailVal.error;

        const passVal = validatePassword(formData.password);
        if (!passVal.isValid) newErrors.password = passVal.error;

        const matchVal = validatePasswordMatch(formData.password, formData.confirmPassword);
        if (!matchVal.isValid) newErrors.confirmPassword = matchVal.error;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await joinBusinessWithCode(
                formData.fullName,
                formData.email,
                formData.password,
                inviteCode
            );

            toast({
                title: "Welcome to the Team! 🎉",
                description: `You've successfully joined ${businessDetails.name}.`,
            });
            
            navigate('/dashboard');
        } catch (error) {
            setErrors({ submit: error.message });
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Components ---
    const PasswordMeter = ({ password }) => {
        const strength = calculatePasswordStrength(password);
        const reqs = getPasswordRequirements(password);

        return (
            <div className="mt-2 space-y-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Strength</span>
                    <span className={cn("font-bold", {
                        'text-red-500': strength.label === 'Weak',
                        'text-orange-500': strength.label === 'Fair',
                        'text-yellow-500': strength.label === 'Good',
                        'text-green-500': strength.label === 'Strong' || strength.label === 'Perfect'
                    })}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-300", strength.color)} style={{ width: strength.width }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {reqs.map(req => (
                        <div key={req.id} className="flex items-center text-[11px] gap-1.5">
                             {req.met ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500/50" />}
                             <span className={req.met ? "text-slate-400" : "text-slate-600"}>{req.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const BusinessIcon = ({ type }) => {
        switch(type) {
            case 'retail': return <Store className="h-8 w-8 text-blue-400" />;
            case 'agency': return <Briefcase className="h-8 w-8 text-purple-400" />;
            case 'education': return <GraduationCap className="h-8 w-8 text-yellow-400" />;
            case 'service': return <Wrench className="h-8 w-8 text-orange-400" />;
            default: return <Building2 className="h-8 w-8 text-slate-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <Helmet><title>Join Team - Bangali Enterprise</title></Helmet>
            
            <Card className="w-full max-w-md bg-[#1e293b] border-slate-700 shadow-2xl relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 z-10" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <CardContent className="pt-8 pb-8 px-6 relative z-20">
                    <div className="flex justify-center mb-6">
                        <BangaliLogoFull size="md" />
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <h1 className="text-xl font-bold text-white">
                                {step === 1 ? "Join Team" : step === 2 ? "Confirm Team" : "Create Account"}
                            </h1>
                            <span className="text-xs text-slate-400">Step {step} of 3</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-blue-600"
                                initial={{ width: "33%" }}
                                animate={{ width: `${step * 33.33}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-6">
                                    <h2 className="text-lg font-medium text-white">Enter your invitation code</h2>
                                    <p className="text-slate-400 text-sm">Ask your admin for the unique code to join the workspace.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-300">Invite Code</label>
                                    <div className="relative">
                                        <Input 
                                            value={inviteCode}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                if (val.length <= 8) setInviteCode(val);
                                                if(errors.inviteCode) setErrors({});
                                            }}
                                            placeholder="XXX-XXXX"
                                            className={cn(
                                                "bg-slate-950 border-slate-700 text-white text-center font-mono text-2xl tracking-widest h-16 uppercase placeholder:text-slate-800",
                                                errors.inviteCode && "border-red-500 ring-1 ring-red-500/50"
                                            )}
                                        />
                                    </div>
                                    {errors.inviteCode && (
                                        <div className="flex items-center gap-2 text-xs text-red-400 justify-center animate-in fade-in">
                                            <AlertTriangle className="h-3 w-3" />
                                            {errors.inviteCode}
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    onClick={handleVerifyCode} 
                                    disabled={!inviteCode || loading} 
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-lg font-medium shadow-lg shadow-blue-900/20"
                                >
                                    {loading ? "Verifying..." : "Verify Code"}
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && businessDetails && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-slate-950/50 border border-slate-700 rounded-xl p-6 space-y-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
                                            <BusinessIcon type={businessDetails.type} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{businessDetails.name}</h3>
                                            <p className="text-sm text-slate-400 capitalize">{businessDetails.type} Business</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                                            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                                            <span className="text-xs text-slate-300">You will join as <strong className="text-white capitalize">{businessDetails.role}</strong></span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                        <div className="space-y-1 text-center">
                                            <p className="text-xs text-slate-500 uppercase">Owner</p>
                                            <p className="text-sm font-medium text-white">{businessDetails.owner_email || 'Hidden'}</p>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="text-xs text-slate-500 uppercase">Status</p>
                                            <p className="text-sm font-medium text-green-400">Active Verified</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 h-11">
                                        Back
                                    </Button>
                                    <Button onClick={handleConfirmBusiness} className="flex-1 bg-blue-600 hover:bg-blue-500 h-11">
                                        Confirm & Continue
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                                        <Input 
                                            name="fullName"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={cn("bg-slate-950 border-slate-700 text-white", errors.fullName && "border-red-500")}
                                        />
                                        {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                                        <Input 
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={cn("bg-slate-950 border-slate-700 text-white", errors.email && "border-red-500")}
                                        />
                                        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Password</label>
                                        <div className="relative">
                                            <Input 
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={cn("bg-slate-950 border-slate-700 text-white pr-10", errors.password && "border-red-500")}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <PasswordMeter password={formData.password} />
                                        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                        <Input 
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={cn("bg-slate-950 border-slate-700 text-white", errors.confirmPassword && "border-red-500")}
                                        />
                                        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                                    </div>
                                    
                                    {errors.submit && (
                                         <div className="p-3 bg-red-900/20 border border-red-900 rounded-lg text-red-300 text-sm flex items-center gap-2">
                                             <AlertTriangle className="h-4 w-4 shrink-0" />
                                             {errors.submit}
                                         </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 h-11">
                                        Back
                                    </Button>
                                    <Button onClick={handleRegister} disabled={loading} className="flex-[2] bg-blue-600 hover:bg-blue-500 h-11 font-medium">
                                        {loading ? "Creating Account..." : "Create Account & Join"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
                        <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                            Already a member? <span className="text-blue-400 font-medium hover:underline">Login here</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinExistingBusiness;