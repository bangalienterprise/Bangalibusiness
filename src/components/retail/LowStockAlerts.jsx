
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const LowStockAlerts = ({ products = [], isLoading }) => {
    if (isLoading) return <div className="h-32 bg-slate-900 animate-pulse rounded-lg"></div>;

    // Filter provided products locally as fallback, although prompt says getLowStockProducts usage
    // This component assumes it receives the already filtered low stock list OR full list
    // We will assume it receives a list that MIGHT contain normal items but we filter just in case
    
    const lowStockItems = products.filter(p => p.stock_qty <= p.min_stock_alert).slice(0, 5);

    if (lowStockItems.length === 0) {
        return (
            <Card className="bg-green-950/20 border-green-900/50">
                <CardContent className="p-6 text-center">
                    <p className="text-green-400 text-sm font-medium">All products are well stocked</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-red-950/20 border-red-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-400 flex items-center text-sm font-bold">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {lowStockItems.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm border-b border-red-900/20 pb-2 last:border-0">
                        <div className="overflow-hidden">
                            <p className="text-white truncate font-medium">{p.name}</p>
                            <p className="text-xs text-red-400">
                                Stock: {p.stock_qty} / {p.min_stock_alert} (Short: {p.min_stock_alert - p.stock_qty})
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default LowStockAlerts;
