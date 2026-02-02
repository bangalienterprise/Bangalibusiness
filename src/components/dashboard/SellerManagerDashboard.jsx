import React from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { ShoppingCart } from 'lucide-react';

const SellerManagerDashboard = () => {
    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="My Sales" value="0" icon={ShoppingCart} />
             </div>
        </div>
    );
};
export default SellerManagerDashboard;