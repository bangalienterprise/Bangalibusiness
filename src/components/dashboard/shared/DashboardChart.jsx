import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Loader2, BarChart2 } from 'lucide-react';

const DashboardChart = ({ 
  title, 
  data = [], 
  type = 'line', 
  dataKey, 
  xAxisKey = 'name',
  loading = false,
  height = 350,
  emptyMessage = "No data available to display."
}) => {
  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: height }} className="w-full flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading chart data...</p>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ChartComponent data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey={xAxisKey} 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Legend />
                <DataComponent 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </ChartComponent>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <div className="bg-slate-700/50 p-3 rounded-full mb-3">
                    <BarChart2 className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-300">{emptyMessage}</p>
                <p className="text-xs text-slate-500 mt-1">Start activity to see trends here.</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;