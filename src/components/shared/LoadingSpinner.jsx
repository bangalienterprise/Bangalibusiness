
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ text, className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[200px] w-full gap-3 text-slate-400", className)}>
      <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
      {text && <p className="text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
