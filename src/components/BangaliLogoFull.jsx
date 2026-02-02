
import React from 'react';
import { cn } from '@/lib/utils';
import BangaliLogo from './BangaliLogo';

const BangaliLogoFull = ({ size = 'md', className, logoOnly = false, logoUrl }) => {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <BangaliLogo size={size} logoUrl={logoUrl} />
      {!logoOnly && (
        <div className="text-center leading-tight">
          <h2 className={cn("font-bold tracking-wider text-[#16a34a]", textSizes[size])}>
            BANGALI
          </h2>
          <h3 className={cn("font-medium tracking-[0.2em] text-[#dc2626]",
            size === 'sm' ? 'text-[0.6rem]' :
              size === 'md' ? 'text-xs' :
                size === 'lg' ? 'text-sm' : 'text-base'
          )}>
            ENTERPRISE
          </h3>
        </div>
      )}
    </div>
  );
};

export default BangaliLogoFull;
