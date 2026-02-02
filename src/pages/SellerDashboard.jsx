import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SellerDashboard = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p>Welcome back! Ready to make some sales?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card><CardHeader><CardTitle>My Sales Today</CardTitle></CardHeader><CardContent>৳0.00</CardContent></Card>
             <Card><CardHeader><CardTitle>My Orders</CardTitle></CardHeader><CardContent>0</CardContent></Card>
        </div>
    </div>
);
export default SellerDashboard;