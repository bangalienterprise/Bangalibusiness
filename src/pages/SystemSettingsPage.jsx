import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemSettingsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">System settings functionality is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;