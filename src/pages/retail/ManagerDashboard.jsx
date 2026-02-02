
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, ClipboardList, TrendingDown } from 'lucide-react';

const ManagerDashboard = () => {
    return (
        <div className="space-y-6">
            <Helmet><title>Manager Dashboard</title></Helmet>
            
            <div>
                <h1 className="text-3xl font-bold text-white">Store Overview</h1>
                <p className="text-slate-400">Manager Access</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/retail/pos">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <ShoppingCart className="h-8 w-8 text-blue-400 mb-2" />
                            <span className="font-semibold text-white">POS</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/retail/stock">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <Package className="h-8 w-8 text-emerald-400 mb-2" />
                            <span className="font-semibold text-white">Stock</span>
                        </CardContent>
                    </Card>
                </Link>
                 <Link to="/retail/orders">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <ClipboardList className="h-8 w-8 text-violet-400 mb-2" />
                            <span className="font-semibold text-white">Orders</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/retail/damage">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <TrendingDown className="h-8 w-8 text-red-400 mb-2" />
                            <span className="font-semibold text-white">Damage</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>
            
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500">
                Full manager dashboard metrics coming soon.
            </div>
        </div>
    );
};

export default ManagerDashboard;
