import React from 'react';
import { Helmet } from 'react-helmet';
import { AlertTriangle, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BangaliLogoFull from '@/components/BangaliLogoFull';

const ErrorPage = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 text-white">
            <Helmet><title>Error - Bangali Enterprise</title></Helmet>
            <div className="w-full max-w-md text-center space-y-6">
                <div className="flex justify-center mb-8"><BangaliLogoFull size="md" /></div>
                
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-slate-400 mb-6">An unexpected error occurred. Please try again later or contact support if the issue persists.</p>
                    
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700" asChild>
                            <Link to="/dashboard"><Home className="mr-2 h-4 w-4" /> Go Home</Link>
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-500" asChild>
                            <Link to="mailto:support@bangali.com"><Mail className="mr-2 h-4 w-4" /> Support</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;