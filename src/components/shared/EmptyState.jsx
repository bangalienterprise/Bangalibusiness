
import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "No items found", 
  description = "Get started by creating your first item.", 
  actionLabel, 
  onAction,
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/50", className)}>
      <div className="bg-slate-800 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
