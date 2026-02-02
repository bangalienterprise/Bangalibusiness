import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/usePermission';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkPermissionRisk, formatPermissionName } from '@/utils/permissionUtils';

const PermissionGatedButton = ({ 
  permission, 
  children, 
  variant = "default", 
  size = "default", 
  className, 
  onClick,
  disabled = false,
  tooltip,
  ...props 
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(permission);
  const risk = checkPermissionRisk(permission);

  if (!allowed) {
    const defaultTooltip = `You need "${formatPermissionName(permission)}" permission to access this.`;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block cursor-not-allowed">
              <Button 
                variant={variant} 
                size={size} 
                className={cn("opacity-60", className)} 
                disabled 
                {...props}
              >
                <Lock className="mr-2 h-3.5 w-3.5" />
                {children}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <p className="font-semibold text-xs text-destructive flex items-center gap-1 mb-1">
                 Access Denied
            </p>
            <p>{tooltip || defaultTooltip}</p>
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