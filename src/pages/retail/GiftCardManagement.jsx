import React from 'react';
import { Helmet } from 'react-helmet';
import PlaceholderPage from '@/components/PlaceholderPage'; // Or build it out
import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GiftCardManagement = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Gift Cards</title></Helmet>
             <div>
                <h1 className="text-3xl font-bold text-white">Gift Cards</h1>
                <p className="text-slate-400">Manage digital gift cards and coupons.</p>
            </div>
            
            <Card className="bg-slate-900 border-slate-800 p-10 text-center">
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-slate-800 rounded-full">
                        <Gift className="h-10 w-10 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Coming Soon</h2>
                    <p className="text-slate-400 max-w-md">The Gift Card management system is currently under development. You will be able to issue, track, and redeem gift cards here soon.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default GiftCardManagement;