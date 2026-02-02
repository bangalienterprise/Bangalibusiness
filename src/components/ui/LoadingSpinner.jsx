import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ className, text, size = "default" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;