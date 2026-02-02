import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Ghost, 
  title = "No data available", 
  description = "Get started by creating your first item.", 
  actionLabel, 
  onAction 
}) => {
  return (
    <Card className="flex flex-col items-center justify-center py-12 px-4 text-center dark:bg-slate-800/50 dark:border-slate-700 border-dashed">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;