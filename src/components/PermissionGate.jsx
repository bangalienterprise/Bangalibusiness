import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rolePermissions';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PermissionGate = ({ 
  permission, 
  children, 
  fallback = null, 
  showLocked = false 
}) => {
  const { user } = useAuth();
  
  if (!user) return fallback;

  const allowed = hasPermission(user.role, permission, user.permissions);

  if (allowed && !showLocked) {
    return <>{children}</>;
  }

  if (showLocked) {
     return (
        <div className="relative group">
            <div className="opacity-40 pointer-events-none select-none filter blur-[1px]">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md z-10">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-2 p-3 bg-card border shadow-lg rounded-lg cursor-not-allowed">
                                <Lock className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Access Restricted</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                             <p>You need permission to access this feature.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
     );
  }

  return fallback;
};

export default PermissionGate;