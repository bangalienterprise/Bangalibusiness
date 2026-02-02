import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const CommissionCard = ({ 
    title = "Commission",
    amount = 0,
    percentage = 0,
    currency = '৳',
    trend = 0,
    className = ""
}) => {
    return (
        <Card className={`bg-slate-900 border-slate-800 text-white ${className}`}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-slate-400">{title}</div>
                    <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900/50">
                        {percentage}% Cut
                    </Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">{currency}{amount.toLocaleString()}</span>
                    {trend !== 0 && (
                        <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
                    Example: Sale {currency}1000 × {percentage}% = {currency}{(1000 * percentage / 100).toFixed(0)}
                </div>
            </CardContent>
        </Card>
    );
};

export default CommissionCard;