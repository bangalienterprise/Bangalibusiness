import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, // { value: number, label: string, direction: 'up' | 'down' | 'neutral' }
  loading, 
  className,
  onClick 
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center space-x-2 mt-1">
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  trend.direction === 'up' && "text-green-500",
                  trend.direction === 'down' && "text-red-500",
                  trend.direction === 'neutral' && "text-yellow-500"
                )}>
                  {trend.direction === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                  {trend.direction === 'down' && <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {trend.direction === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                  {trend.value}%
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;