import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AllUsersDashboard = () => {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">All Users (Mock)</h1>
        <Card><CardContent className="p-6">User list unavailable in mock mode.</CardContent></Card>
    </div>
  );
};
export default AllUsersDashboard;