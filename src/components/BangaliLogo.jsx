import React from 'react';
import { cn } from '@/lib/utils';
const BangaliLogo = ({
  size = 'md',
  className,
  logoUrl
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const defaultLogo = "https://horizons-cdn.hostinger.com/905a6822-d019-4822-a7aa-855c078f14ef/bangali-icon-fJivu.png";

  return <div className={cn("relative flex items-center justify-center transition-transform hover:scale-105 duration-300", className)}>
    <img
      src={logoUrl || defaultLogo}
      alt="Bangali Enterprise Logo"
      className={cn("object-contain", sizeClasses[size])}
      loading="lazy"
    />
  </div>;
};
export default BangaliLogo;
export { BangaliLogo };