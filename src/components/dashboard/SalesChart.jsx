import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SalesChart = ({ data = [] }) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Mon', revenue: 0 },
    { name: 'Tue', revenue: 0 },
    { name: 'Wed', revenue: 0 },
    { name: 'Thu', revenue: 0 },
    { name: 'Fri', revenue: 0 },
    { name: 'Sat', revenue: 0 },
    { name: 'Sun', revenue: 0 },
  ];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" stroke="#888888" />
                <YAxis className="text-xs" stroke="#888888" tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;