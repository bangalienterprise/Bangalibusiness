
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActions from '@/components/dashboard/QuickActions';
import MonthlySalesTrend from '@/components/dashboard/MonthlySalesTrend';
import InventoryHealth from '@/components/dashboard/InventoryHealth';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const RetailDashboard = () => {
  const { user, business, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    estProfit: 0,
    totalCustomers: 0,
    stockAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business?.id) {
      fetchDashboardData();
    }
  }, [business]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Today's Sales & Profit
      const { data: todaySalesData, error: salesError } = await supabase
        .from('sales_transactions')
        .select('total_amount, profit')
        .eq('business_id', business.id)
        .gte('created_at', today.toISOString());

      if (salesError) throw salesError;

      const todaySales = todaySalesData.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
      const estProfit = todaySalesData.reduce((sum, item) => sum + (Number(item.profit) || 0), 0);

      // 2. Total Customers
      const { count: customerCount, error: customerError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);
        
      if (customerError) throw customerError;

      // 3. Stock Alerts (Low Stock + Out of Stock)
      // Note: This is a simplified check. Ideally, we filter in DB.
      // Fetching only needed columns for performance
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, alert_qty')
        .eq('business_id', business.id);

      if (productError) throw productError;

      const stockAlerts = products.filter(p => (p.stock_quantity || 0) <= (p.alert_qty || 5)).length;

      setMetrics({
        todaySales,
        estProfit,
        totalCustomers: customerCount || 0,
        stockAlerts
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({ variant: "destructive", title: "Failed to load dashboard data" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Dashboard - {business?.name || 'Bangali Enterprise'}</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, <span className="text-slate-200 font-medium">{profile?.full_name}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/retail/pos')} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Sale
        </Button>
      </div>

      <DashboardMetrics metrics={metrics} loading={loading} />
      
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px]">
          <MonthlySalesTrend />
        </div>
        <div className="h-[400px]">
          <InventoryHealth />
        </div>
      </div>

      <RecentTransactions />
    </div>
  );
};

export default RetailDashboard;
