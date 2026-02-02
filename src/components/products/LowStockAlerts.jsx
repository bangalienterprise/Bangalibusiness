
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const LowStockAlerts = ({ products = [], isLoading }) => {
    if (isLoading) return null; // Or skeleton

    const lowStockItems = products
        .filter(p => p.stock_qty <= p.min_stock_alert)
        .sort((a, b) => a.stock_qty - b.stock_qty) // Most critical first
        .slice(0, 5);

    if (lowStockItems.length === 0) return null;

    return (
        <Card className="bg-red-950/20 border-red-900/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-400 flex items-center text-sm font-bold">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Low Stock Alerts ({lowStockItems.length})
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
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-800 text-red-300 hover:bg-red-900/50">
                            Reorder
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default LowStockAlerts;
