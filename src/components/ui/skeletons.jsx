import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

export const CardSkeleton = ({ className }) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
    </Card>
  );
};

export const TableSkeleton = ({ rows = 5, className }) => {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border p-4 space-y-4">
        <div className="flex space-x-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ))}
      </div>
    </div>
  );
};

export { Skeleton };