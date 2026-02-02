import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Lock, AlertCircle } from 'lucide-react';
import { formatPermissionName, getPermissionDescription } from '@/utils/permissionUtils';
import { cn } from '@/lib/utils';

const PermissionBadge = ({ permission, granted = true, size = 'sm', className }) => {
  const variant = granted ? 'default' : 'secondary';
  const Icon = granted ? Check : Lock;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={variant} 
            className={cn(
              "flex items-center gap-1 cursor-help transition-all", 
              !granted && "opacity-50 text-muted-foreground",
              className
            )}
          >
            <Icon className="h-3 w-3" />
            {formatPermissionName(permission)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getPermissionDescription(permission)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PermissionBadge;