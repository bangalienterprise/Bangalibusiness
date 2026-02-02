
import React from 'react';
import { Button } from "@/components/ui/button";
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ icon: Icon = PackageOpen, title, description, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
            <div className="p-4 rounded-full bg-slate-800 mb-4">
                <Icon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-500">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
