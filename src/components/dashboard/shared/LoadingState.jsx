import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const CardSkeleton = () => (
  <Card className="dark:bg-slate-800 dark:border-slate-700">
    <CardHeader className="gap-2">
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-1/3 mb-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
    <div className="rounded-md border dark:border-slate-700">
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LoadingState = ({ type = 'card', count = 1 }) => {
  if (type === 'table') return <TableSkeleton rows={count} />;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingState;