import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-green-500/10 text-green-500',
        red: 'bg-red-500/10 text-red-500',
        purple: 'bg-purple-500/10 text-purple-500',
        orange: 'bg-orange-500/10 text-orange-500',
    };

    return (
        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                        <h3 className="text-2xl font-bold text-white">{value}</h3>
                    </div>
                    <div className={cn("p-3 rounded-lg", colorClasses[color])}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center text-xs">
                        <span className={cn("font-medium", trend.includes('-') || trend === 'Requires Action' ? "text-red-400" : "text-green-400")}>
                            {trend}
                        </span>
                        <span className="text-slate-500 ml-2">vs last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;