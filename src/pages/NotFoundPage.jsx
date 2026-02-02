import React from 'react';
import { Helmet } from 'react-helmet';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BangaliLogoFull from '@/components/BangaliLogoFull';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 text-white">
            <Helmet><title>Page Not Found - Bangali Enterprise</title></Helmet>
            <div className="w-full max-w-md text-center space-y-6">
                <div className="flex justify-center mb-8"><BangaliLogoFull size="md" /></div>
                
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileQuestion className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">404</h1>
                    <h2 className="text-xl font-medium mb-4">Page Not Found</h2>
                    <p className="text-slate-400 mb-6">The page you are looking for doesn't exist or has been moved.</p>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-500" asChild>
                        <Link to="/dashboard"><Home className="mr-2 h-4 w-4" /> Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;