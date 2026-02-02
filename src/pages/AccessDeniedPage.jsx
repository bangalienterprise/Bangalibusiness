
import React from 'react';
import { ShieldAlert, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

const AccessDeniedPage = () => {
    const navigate = useNavigate();
    const { role, logout } = useAuth();
    const { currentBusiness } = useBusiness();

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 p-4">
            <div className="text-center max-w-md w-full bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/50">
                        <ShieldAlert className="h-10 w-10 text-red-500" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-6">
                    You don't have permission to view this page.
                </p>
                
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Your Role:</span>
                        <span className="text-white font-medium capitalize">{role || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Business:</span>
                        <span className="text-white font-medium">{currentBusiness?.name || 'None'}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={() => navigate('/')} 
                        className="w-full bg-blue-600 hover:bg-blue-500"
                    >
                        Go to Dashboard
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={logout} 
                        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                    <Button 
                        variant="ghost" 
                        className="w-full text-slate-500 hover:text-white"
                    >
                        <Mail className="mr-2 h-4 w-4" /> Contact Support
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AccessDeniedPage;
