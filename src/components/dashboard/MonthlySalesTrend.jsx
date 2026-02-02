
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, format, subDays, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';

const MonthlySalesTrend = () => {
  const { business } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business?.id) {
      fetchSalesTrend();
    }
  }, [business]);

  const fetchSalesTrend = async () => {
    try {
      // Get dates for last 4 weeks
      const endDate = new Date();
      const startDate = subDays(endDate, 28); // Approx 4 weeks
      
      const { data: transactions, error } = await supabase
        .from('sales_transactions')
        .select('created_at, total_amount')
        .eq('business_id', business.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Group by week
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate });
      const chartData = weeks.map((weekStart, index) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weeklyTotal = transactions
          .filter(t => {
            const tDate = new Date(t.created_at);
            return tDate >= weekStart && tDate <= weekEnd;
          })
          .reduce((sum, t) => sum + Number(t.total_amount), 0);

        return {
          name: `Week ${index + 1}`,
          amount: weeklyTotal
        };
      });

      setData(chartData);
    } catch (error) {
      console.error('Error fetching sales trend:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
           <div className="h-5 w-1 bg-blue-500 rounded-full"></div> Monthly Sales Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {loading ? (
             <div className="h-full flex items-center justify-center text-slate-500">Loading chart...</div>
          ) : data.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-500">No sales data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(value) => `৳${value}`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value) => [`৳${value}`, 'Sales']}
                />
                <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesTrend;
