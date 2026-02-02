import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BusinessProfilePage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Business Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Business profile management functionality is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessProfilePage;