import React from 'react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';

// Inner component to check loading/error state
const SettingsLoader = ({ children }) => {
    const { loading, error, refreshSettings } = useSettings();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading configurations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Settings Failed to Load</h2>
                <p className="text-slate-400 mb-6 text-center max-w-md">
                    We encountered an issue loading your business configuration. This might be due to a network error.
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700">
                        Refresh Page
                    </Button>
                    <Button onClick={refreshSettings} className="bg-blue-600">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                </div>
            </div>
        );
    }

    return children;
};

// Main wrapper
const SettingsProviderWrapper = ({ children }) => {
    return (
        <SettingsProvider>
            <SettingsLoader>
                {children}
            </SettingsLoader>
        </SettingsProvider>
    );
};

export default SettingsProviderWrapper;