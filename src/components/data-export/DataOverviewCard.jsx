import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useBusiness } from '@/contexts/BusinessContext';

const DataOverviewCard = () => {
  const { activeBusiness } = useBusiness();
  const [counts, setCounts] = useState({ customers: 0, sales: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!activeBusiness?.id) return;
      
      try {
        const [customers, sales, products] = await Promise.all([
          supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
          supabase.from('sales').select('*', { count: 'exact', head: true }).eq('business_id', activeBusiness.id),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', activeBusiness.id)
        ]);

        setCounts({
          customers: customers.count || 0,
          sales: sales.count || 0,
          products: products.count || 0
        });
      } catch (error) {
        console.error("Error fetching data counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [activeBusiness]);

  if (loading) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700 mb-8">
        <CardContent className="p-6 flex justify-center items-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{counts.customers.toLocaleString()}</div>
          <p className="text-xs text-slate-500">Registered in database</p>
        </CardContent>
      </Card>
      
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total Sales/Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{counts.sales.toLocaleString()}</div>
          <p className="text-xs text-slate-500">Transactions recorded</p>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Products/Services</CardTitle>
          <Package className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{counts.products.toLocaleString()}</div>
          <p className="text-xs text-slate-500">Items in inventory</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataOverviewCard;