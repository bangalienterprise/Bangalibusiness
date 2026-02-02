
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart, History, DollarSign } from 'lucide-react';
import MyCommissionPage from './MyCommissionPage'; // Reuse components

const SellerDashboard = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Seller Dashboard</title></Helmet>
            
            <div>
                <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                <p className="text-slate-400">Seller Access</p>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/retail/pos">
                    <Card className="bg-blue-600 border-blue-500 hover:bg-blue-500 cursor-pointer shadow-lg shadow-blue-900/20">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-white">
                            <ShoppingCart className="h-10 w-10 mb-3" />
                            <span className="text-xl font-bold">New Sale</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/retail/sales-history">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <History className="h-10 w-10 text-slate-400 mb-3" />
                            <span className="font-semibold text-white">My Sales</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/retail/my-commission">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <DollarSign className="h-10 w-10 text-green-400 mb-3" />
                            <span className="font-semibold text-white">My Commission</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Reuse Commission stats directly here for quick view */}
            <div className="mt-8">
                 <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
                 <MyCommissionPage /> 
            </div>
        </div>
    );
};

export default SellerDashboard;
