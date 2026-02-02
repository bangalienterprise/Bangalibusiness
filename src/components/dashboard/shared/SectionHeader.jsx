import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SectionHeader = ({ icon: Icon, title, description, action, className }) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;