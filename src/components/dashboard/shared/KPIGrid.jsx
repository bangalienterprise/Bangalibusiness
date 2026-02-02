import React from 'react';
import { cn } from '@/lib/utils';

const KPIGrid = ({ children, className }) => {
  return (
    <div className={cn(
      "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
};

export default KPIGrid;