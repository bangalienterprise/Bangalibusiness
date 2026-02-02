import React from 'react';
import { Helmet } from 'react-helmet';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description, icon: Icon = Construction, actionLabel = "Add New" }) => (
  <DashboardShell title={title} description={description}>
    <Helmet><title>{title} - Bangali Enterprise</title></Helmet>
    <div className="flex justify-end mb-4">
        <Button><Plus className="mr-2 h-4 w-4" /> {actionLabel}</Button>
    </div>
    <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed bg-muted/10">
       <div className="bg-primary/10 p-6 rounded-full mb-6">
         <Icon className="h-12 w-12 text-primary" />
       </div>
       <h3 className="text-2xl font-semibold mb-2">{title}</h3>
       <p className="text-muted-foreground max-w-md mb-8">
         This feature is part of the <strong>{title}</strong> module. We are currently working on this feature to bring you the best experience.
       </p>
       <div className="flex gap-4">
          <Button variant="outline">Learn More</Button>
          <Button>Notify Me When Ready</Button>
       </div>
    </Card>
  </DashboardShell>
);

export default PlaceholderPage;