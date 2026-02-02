
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Utensils, Wrench, Briefcase, GraduationCap, User, ArrowRight, Loader2, Eye, EyeOff, Building, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import BangaliLogoFull from '@/components/BangaliLogoFull';
import { inviteService } from '@/services/inviteService';
import { calculatePasswordStrength, getPasswordRequirements } from '@/lib/formValidation';

const SignupPage = () => {
    const [step, setStep] = useState(1);
    const [accountType, setAccountType] = useState(null); // 'create' or 'join'
    const [formData, setFormData] = useState({ 
        fullName: '', 
        email: '', 
        password: '', 
        businessName: '', 
        businessType: '',
        inviteCode: ''
    });
    const [inviteStatus, setInviteStatus] = useState({ valid: false, checking: false, data: null });
    
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const businessTypes = [
        { id: 'Retail Store', label: 'Retail Store', icon: ShoppingCart, description: 'Shops, marts, groceries' },
        { id: 'Restaurant', label: 'Restaurant', icon: Utensils, description: 'Cafes, dining' },
        { id: 'Service Provider', label: 'Service Provider', icon: Wrench, description: 'Repair, salon' },
        { id: 'Agency', label: 'Agency', icon: Briefcase, description: 'Marketing, design' },
        { id: 'Education', label: 'Education', icon: GraduationCap, description: 'Schools, coaching' },
        { id: 'Freelancer', label: 'Freelancer', icon: User, description: 'Individual professional' }
    ];

    const passwordStrength = calculatePasswordStrength(formData.password);
    const passwordRequirements = getPasswordRequirements(formData.password);

    const handleInviteCheck = async (code) => {
        setFormData(prev => ({...prev, inviteCode: code}));
        if (code.length < 6) {
            setInviteStatus({ valid: false, checking: false, data: null });
            return;
        }
        setInviteStatus({ ...inviteStatus, checking: true });
        const res = await inviteService.validateInviteCode(code);
        setInviteStatus({ valid: res.valid, checking: false, data: res.valid ? res.business : null });
    };

    const nextStep = () => {
        if (step === 1 && !accountType) {
            toast({ variant: "destructive", title: "Selection Required", description: "Please choose an account type" });
            return;
        }
        if (step === 2) {
            if (!formData.fullName || !formData.email || !formData.password) {
                toast({ variant: "destructive", title: "Incomplete Details", description: "Please fill in all fields" });
                return;
            }
            if (passwordStrength.score < 3) {
                 toast({ variant: "destructive", title: "Weak Password", description: "Please use a stronger password" });
                 return;
            }
            // If joining, skip business type selection (step 3)
            if (accountType === 'join') {
                setStep(4);
                return;
            }
        }
        if (step === 3 && accountType === 'create' && !formData.businessType) {
             toast({ variant: "destructive", title: "Selection Required", description: "Please select a business type" });
             return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        if (step === 4 && accountType === 'join') {
            setStep(2);
        } else {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        if (accountType === 'create' && !formData.businessName) {
             toast({ variant: "destructive", title: "Error", description: "Business Name required" });
             return;
        }
        if (accountType === 'join' && !inviteStatus.valid) {
             toast({ variant: "destructive", title: "Error", description: "Valid Invite Code required" });
             return;
        }
        
        setLoading(true);
        try {
            const res = await signup(
                formData.email, 
                formData.password, 
                formData.fullName, 
                formData.businessType, 
                formData.businessName,
                accountType,
                formData.inviteCode
            );
            
            if (res.error) throw res.error;
            
            toast({ title: "Welcome!", description: "Account created successfully!" });
            navigate(`/retail/dashboard`);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Signup Failed", description: error.message || "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
             <div className="w-full max-w-lg space-y-6">
                <div className="flex justify-center mb-6">
                    <BangaliLogoFull size="md" />
                </div>

                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-2 bg-slate-900/50 border-b border-slate-700">
                        <CardTitle className="text-xl font-bold text-white">Create Account</CardTitle>
                        <CardDescription className="text-slate-400">Step {step} of 4</CardDescription>
                        <div className="flex gap-1 h-1.5 w-full max-w-[200px] mx-auto mt-4 rounded-full bg-slate-800 overflow-hidden">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={cn("h-full w-1/4 transition-colors duration-300", step >= i ? "bg-[#16a34a]" : "bg-transparent")} />
                            ))}
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="text-center space-y-2 mb-6">
                                    <h3 className="text-lg font-medium text-white">What would you like to do?</h3>
                                </div>
                                
                                <button 
                                    onClick={() => setAccountType('create')}
                                    className={cn("w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:bg-slate-800", accountType === 'create' ? "border-[#16a34a] bg-[#16a34a]/10" : "border-slate-700 bg-transparent")}
                                >
                                    <div className="h-12 w-12 rounded-full bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
                                        <Building className="h-6 w-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-white">Create a New Business</div>
                                        <div className="text-sm text-slate-400">I am a business owner</div>
                                    </div>
                                    {accountType === 'create' && <CheckCircle className="h-5 w-5 text-[#16a34a]" />}
                                </button>

                                <button 
                                    onClick={() => setAccountType('join')}
                                    className={cn("w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:bg-slate-800", accountType === 'join' ? "border-blue-500 bg-blue-900/10" : "border-slate-700 bg-transparent")}
                                >
                                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-white">Join Existing Business</div>
                                        <div className="text-sm text-slate-400">I have an invite code</div>
                                    </div>
                                    {accountType === 'join' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                                </button>

                                <Button onClick={nextStep} className="w-full bg-[#16a34a] hover:bg-[#15803d] mt-4" disabled={!accountType}>Next Step <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Full Name</Label>
                                    <Input 
                                        value={formData.fullName} 
                                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                        className="bg-slate-900/50 border-slate-600 text-white focus:border-[#16a34a] focus:ring-[#16a34a]" 
                                        placeholder="John Doe" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Email Address</Label>
                                    <Input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})} 
                                        className="bg-slate-900/50 border-slate-600 text-white focus:border-[#16a34a] focus:ring-[#16a34a]" 
                                        placeholder="name@example.com" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Password</Label>
                                    <div className="relative">
                                        <Input 
                                            type={showPassword ? "text" : "password"} 
                                            value={formData.password} 
                                            onChange={e => setFormData({...formData, password: e.target.value})} 
                                            className="bg-slate-900/50 border-slate-600 text-white pr-10 focus:border-[#16a34a] focus:ring-[#16a34a]" 
                                            placeholder="••••••••" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3 top-3 text-slate-500 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    
                                    {/* Password Strength Indicator */}
                                    {formData.password && (
                                        <div className="space-y-2 pt-2">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Strength: <span className={cn("font-medium", passwordStrength.score > 2 ? "text-[#16a34a]" : "text-red-400")}>{passwordStrength.label}</span></span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className={cn("h-full transition-all duration-300", passwordStrength.color)} style={{ width: passwordStrength.width }} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 mt-2">
                                                {passwordRequirements.map(req => (
                                                    <div key={req.id} className="flex items-center text-[10px] text-slate-400">
                                                        {req.met ? <CheckCircle className="h-3 w-3 mr-1 text-[#16a34a]" /> : <XCircle className="h-3 w-3 mr-1 text-slate-600" />}
                                                        <span className={req.met ? "text-slate-300" : ""}>{req.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-6">
                                    <Button variant="ghost" onClick={prevStep} className="w-1/3 text-slate-400 hover:text-white">Back</Button>
                                    <Button onClick={nextStep} className="w-2/3 bg-[#16a34a] hover:bg-[#15803d]">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && accountType === 'create' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {businessTypes.map((type) => (
                                        <div 
                                            key={type.id} 
                                            onClick={() => setFormData({...formData, businessType: type.id})} 
                                            className={cn("p-4 border rounded-xl cursor-pointer flex flex-col items-center gap-2 text-center transition-all", formData.businessType === type.id ? "bg-[#16a34a]/20 border-[#16a34a] text-white ring-1 ring-[#16a34a]" : "bg-slate-900/50 border-slate-600 text-slate-400 hover:bg-slate-800")}
                                        >
                                            <type.icon className="h-6 w-6 mb-1" />
                                            <span className="text-sm font-medium">{type.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" onClick={prevStep} className="w-1/3 text-slate-400 hover:text-white">Back</Button>
                                    <Button onClick={nextStep} disabled={!formData.businessType} className="w-2/3 bg-[#16a34a] hover:bg-[#15803d]">Next Step</Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                {accountType === 'create' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Business Name</Label>
                                            <Input 
                                                value={formData.businessName} 
                                                onChange={e => setFormData({...formData, businessName: e.target.value})} 
                                                className="bg-slate-900/50 border-slate-600 text-white focus:border-[#16a34a] focus:ring-[#16a34a]" 
                                                placeholder="e.g. Dhaka Electronics" 
                                            />
                                        </div>
                                        <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-900/50 text-sm text-blue-200">
                                            <p>Creating <strong className="capitalize">{formData.businessType}</strong> as <strong>{formData.fullName}</strong>.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Enter Invite Code</Label>
                                            <Input 
                                                value={formData.inviteCode} 
                                                onChange={e => handleInviteCheck(e.target.value)} 
                                                className={cn("bg-slate-900/50 text-white uppercase tracking-widest text-center text-lg focus:ring-[#16a34a]", inviteStatus.valid ? "border-[#16a34a]" : "border-slate-600")} 
                                                placeholder="ABC-123" 
                                                maxLength={8}
                                            />
                                            {inviteStatus.checking && <p className="text-xs text-blue-400 flex items-center justify-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Verifying code...</p>}
                                            {inviteStatus.valid && inviteStatus.data && (
                                                <div className="p-4 mt-4 rounded-lg bg-green-900/20 border border-green-900/50 text-center">
                                                    <p className="text-[#16a34a] text-sm">Joining Business:</p>
                                                    <p className="text-white font-bold text-lg">{inviteStatus.data.name}</p>
                                                    <p className="text-slate-400 text-xs uppercase">{inviteStatus.data.type}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" onClick={prevStep} className="w-1/3 text-slate-400 hover:text-white">Back</Button>
                                    <Button 
                                        onClick={handleSubmit} 
                                        disabled={loading || (accountType === 'join' && !inviteStatus.valid)} 
                                        className="w-2/3 bg-[#16a34a] hover:bg-[#15803d]"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Complete Setup"}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
                <div className="text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-[#16a34a] hover:underline">Log in</Link>
                </div>
             </div>
        </div>
    );
};

export default SignupPage;
