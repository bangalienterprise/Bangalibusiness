import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/usePermission';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const PermissionGatedButton = ({ 
  permission, 
  children, 
  variant = "default", 
  size = "default", 
  className, 
  onClick,
  disabled = false,
  tooltip = "You do not have permission to perform this action.",
  hideIfDenied = false,
  ...props 
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(permission);

  if (!allowed && hideIfDenied) {
    return null;
  }

  if (!allowed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block cursor-not-allowed">
              <Button 
                variant={variant} 
                size={size} 
                className={cn("opacity-50", className)} 
                disabled 
                {...props}
              >
                <Lock className="mr-2 h-4 w-4" />
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PermissionGatedButton;