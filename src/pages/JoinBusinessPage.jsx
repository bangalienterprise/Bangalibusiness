import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { Loader2, CheckCircle, AlertTriangle, ArrowRight, Building2, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BangaliLogoFull from '@/components/BangaliLogoFull';

const JoinBusinessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const initialCode = searchParams.get('code') || '';
  const [inputCode, setInputCode] = useState(initialCode);
  
  const [inviteDetails, setInviteDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Auto-verify if code is present in URL
  useEffect(() => {
    if (initialCode && !inviteDetails && !error) {
      handleVerifyCode(initialCode);
    }
  }, [initialCode]);

  const handleVerifyCode = async (codeToVerify) => {
    setLoading(true);
    setError(null);
    try {
      // Use MockDatabase instead of Supabase
      const invite = mockDatabase.inviteCodes.find(
        c => c.code === codeToVerify && c.status === 'active'
      );

      if (!invite) {
        throw new Error("Invalid or expired invite code.");
      }

      const business = mockDatabase.getBusiness(invite.business_id);
      if (!business) {
        throw new Error("Associated business not found.");
      }

      setInviteDetails({
        ...invite,
        businessName: business.name,
        businessType: business.type
      });
    } catch (err) {
      setError(err.message);
      setInviteDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !inviteDetails) return;
    setLoading(true);
    try {
      await mockDatabase.joinBusinessWithCode(user.id, inputCode);
      
      setSuccess(true);
      toast({ 
        title: "Welcome Aboard! 🎉", 
        description: `You have successfully joined ${inviteDetails.businessName}.` 
      });
      
      setTimeout(() => {
         window.location.href = '/dashboard'; 
      }, 2000);

    } catch (err) {
      toast({ title: "Join Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a]"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 text-white">
      <Card className="w-full max-w-md border-slate-700 bg-[#1e293b] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4"><BangaliLogoFull size="md" /></div>
          <CardTitle className="text-2xl">Join Team</CardTitle>
          <CardDescription className="text-slate-400">
             Enter your invitation code to access the workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 text-green-500 animate-in zoom-in">
                  <CheckCircle className="h-16 w-16" />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">Successfully Joined!</h3>
                    <p className="text-sm text-slate-400 mt-1">Redirecting to dashboard...</p>
                  </div>
              </div>
          ) : (
            <div className="space-y-6">
               {!inviteDetails ? (
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">Invite Code</label>
                     <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="XXX-XXXX"
                        className="flex h-12 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-center text-lg font-mono uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                   </div>
                   <Button 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-500" 
                      onClick={() => handleVerifyCode(inputCode)}
                      disabled={!inputCode || loading}
                   >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Code"}
                   </Button>
                   {error && (
                     <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                     </Alert>
                   )}
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700 space-y-4">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm mb-1">You are invited to join</p>
                          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            {inviteDetails.businessName}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-slate-800">
                          <span className="text-sm text-slate-400">Role Assigned</span>
                          <span className="text-sm font-medium text-green-400 uppercase flex items-center gap-1">
                            <User className="h-3 w-3" /> {inviteDetails.role}
                          </span>
                        </div>
                    </div>

                    {!isAuthenticated ? (
                        <div className="space-y-3">
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500" onClick={() => navigate(`/login?redirect=/join-business?code=${inputCode}`)}>
                                Login to Accept
                            </Button>
                            <Button variant="outline" className="w-full h-12 border-slate-600 text-white hover:bg-slate-800" onClick={() => navigate(`/signup?accountType=join&inviteCode=${inputCode}`)}>
                                Create Account
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/20 border border-blue-900/50">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                                  {user.email[0].toUpperCase()}
                                </div>
                                <div className="text-sm">
                                  <p className="text-slate-300">Signed in as</p>
                                  <p className="font-medium text-white">{user.email}</p>
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold" onClick={handleJoin} disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Accept & Join Team"}
                            </Button>
                        </div>
                    )}
                    <Button variant="ghost" className="w-full text-slate-400" onClick={() => { setInviteDetails(null); setInputCode(''); }}>
                        Cancel
                    </Button>
                 </div>
               )}
            </div>
          )}
        </CardContent>
        {(!success && !inviteDetails) && (
            <CardFooter className="justify-center border-t border-slate-800 py-4">
                <Link to="/login" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                   Already a member? <span className="text-blue-400">Login here</span>
                </Link>
            </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default JoinBusinessPage;