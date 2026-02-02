import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { calculateCommission } from '@/utils/commissionCalculator';

const CommissionBreakdown = ({ 
    saleAmount = 0, 
    commissionPercentage = 0,
    currency = '৳'
}) => {
    const commission = calculateCommission(saleAmount, commissionPercentage);
    const netAmount = saleAmount - commission;

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Sale Amount</span>
                    <span className="font-bold text-lg">{currency}{saleAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Commission Rate</span>
                    <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-600/30">
                        {commissionPercentage}%
                    </span>
                </div>
                
                <div className="h-px bg-slate-800 my-2"></div>
                
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Commission</span>
                    <span className="font-bold text-green-400">{currency}{commission.toFixed(2)}</span>
                </div>
                
                <div className="text-[10px] text-center text-slate-500 mt-2 bg-slate-900/50 py-1 rounded">
                    Formula: {currency}{saleAmount} × {commissionPercentage}% = {currency}{commission.toFixed(2)}
                </div>
            </CardContent>
        </Card>
    );
};

export default CommissionBreakdown;