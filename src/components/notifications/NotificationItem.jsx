import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, AlertOctagon, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationItem = ({ notification, onMarkRead, compact = false }) => {
  const { id, title, message, severity, created_at, is_read } = notification;
  
  const getIcon = () => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (is_read) return 'bg-card';
    switch (severity) {
      case 'critical': return 'bg-red-500/5 hover:bg-red-500/10';
      case 'warning': return 'bg-amber-500/5 hover:bg-amber-500/10';
      default: return 'bg-blue-500/5 hover:bg-blue-500/10';
    }
  };

  return (
    <div 
      className={cn(
        "relative group flex items-start gap-3 p-3 rounded-lg transition-colors border border-transparent",
        getBgColor(),
        !is_read && "border-l-2 border-l-primary",
        is_read && "hover:bg-accent/50"
      )}
    >
      <div className="mt-1 shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-medium leading-none truncate", !is_read && "text-foreground")}>
            {title}
          </p>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </span>
        </div>
        
        <p className={cn("text-xs text-muted-foreground line-clamp-2", compact && "line-clamp-1")}>
          {message}
        </p>
      </div>

      {!is_read && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(id);
          }}
          title="Mark as read"
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
      {!is_read && (
         <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary block md:hidden" />
      )}
    </div>
  );
};

export default NotificationItem;