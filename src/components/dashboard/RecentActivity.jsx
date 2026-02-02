import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const RecentActivity = ({ activities = [] }) => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
                {activities.length > 0 ? activities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                            activity.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                            {activity.type === 'order' ? <ShoppingCart className="h-4 w-4" /> : 
                             activity.type === 'alert' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground py-8">
                        No recent activity
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;