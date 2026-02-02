
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Percent } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';

const StockValuationCard = ({ valuation, isLoading, error }) => {
    if (isLoading) return <SkeletonLoader variant="card" count={4} />;
    
    if (error || !valuation) return null;

    const { totalItems, costValue, sellingValue, profit, marginPercent } = valuation;

    const MetricCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{title}</p>
                        <h3 className={`text-2xl font-bold mt-2 ${colorClass || 'text-white'}`}>{value}</h3>
                        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
                    </div>
                    <div className="p-2 bg-slate-800 rounded-lg">
                        <Icon className="h-5 w-5 text-slate-400" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard 
                title="Total Stock Items" 
                value={totalItems.toLocaleString()} 
                icon={Package} 
            />
            <MetricCard 
                title="Inventory Cost Value" 
                value={`৳${costValue.toLocaleString()}`} 
                icon={DollarSign} 
            />
            <MetricCard 
                title="Potential Revenue" 
                value={`৳${sellingValue.toLocaleString()}`} 
                icon={TrendingUp} 
                colorClass="text-green-400"
            />
            <MetricCard 
                title="Est. Profit Margin" 
                value={`${marginPercent.toFixed(1)}%`} 
                subtext={`Potential Profit: ৳${profit.toLocaleString()}`}
                icon={Percent} 
                colorClass={marginPercent > 30 ? "text-green-500" : "text-yellow-500"}
            />
        </div>
    );
};

export default StockValuationCard;
