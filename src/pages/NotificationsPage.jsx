import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Trash2 } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markAsRead, removeNotification } = useNotifications();

  return (
    <>
      <Helmet><title>Notifications</title></Helmet>
      <DashboardShell>
        <div className="space-y-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-400">No new notifications.</p>
            ) : (
              notifications.map(note => (
                <Card key={note.id} className={`bg-gray-900 border-gray-800 text-white ${!note.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex gap-4">
                      <Bell className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <CardTitle className="text-base">{note.title}</CardTitle>
                        <CardDescription className="text-gray-400">{note.message}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!note.is_read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(note.id)}>Mark Read</Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => removeNotification(note.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </DashboardShell>
    </>
  );
};

export default NotificationsPage;