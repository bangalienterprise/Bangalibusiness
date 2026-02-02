import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';

const NotificationDropdown = ({ businessId, userId, role, isMobile }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(businessId, userId, role);

  const handleViewAll = () => {
    navigate('/notifications');
  };

  const Trigger = (
    <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-background box-content animate-in zoom-in">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );

  const Content = (
    <div className="flex flex-col h-full max-h-[500px] w-full md:w-[380px]">
      <div className="p-4 flex items-center justify-between bg-card z-10 sticky top-0 border-b">
        <div className="flex items-center gap-2">
           <h4 className="font-semibold text-sm">Notifications</h4>
           {unreadCount > 0 && <Badge variant="secondary" className="text-xs h-5 px-1.5">{unreadCount} new</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="xs" onClick={markAllAsRead} className="h-7 text-xs gap-1 text-muted-foreground hover:text-primary">
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {loading ? (
           <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted/50" />
                      <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-muted/50" />
                          <div className="h-3 w-full rounded bg-muted/50" />
                      </div>
                  </div>
              ))}
           </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs opacity-70">New alerts will appear here</p>
          </div>
        ) : (
          <div className="p-1">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onMarkRead={markAsRead}
                compact={true}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-2 border-t bg-card sticky bottom-0">
        <Button variant="ghost" className="w-full text-xs h-8" onClick={handleViewAll}>
          View all notifications
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {Trigger}
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
           {Content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {Trigger}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={5}>
        {Content}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;