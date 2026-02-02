
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductionBanner = ({ issues = [], ready = true }) => {
    // Only show if Env is production
    const isProduction = import.meta.env.VITE_APP_ENV === 'production';
    if (!isProduction) return null;

    if (ready) {
        return null; // Don't annoy users if everything is fine
    }

    return (
        <div className="bg-amber-950/80 border-b border-amber-900 px-4 py-2">
            <div className="container mx-auto flex items-center justify-between text-amber-200 text-sm">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Production Warning:</span> 
                    <span>System checks detected potential configuration issues.</span>
                </div>
                <Link to="/admin/health-check" className="underline hover:text-white">View Status</Link>
            </div>
        </div>
    );
};

export default ProductionBanner;
