import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import RecentActivity from './RecentActivity';
import SuspenseLoader from '@/components/SuspenseLoader';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { business } = useBusiness();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerStats = async () => {
      if (!user?.id || !business?.id) return;

      try {
        const { data: salesData } = await supabase
          .from('sales')
          .select('id, final_amount, amount_paid, sale_date')
          .eq('seller_id', user.id)
          .eq('business_id', business.id);

        const totalSales = salesData?.length || 0;
        const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0;
        const totalCollected = salesData?.reduce((sum, sale) => sum + (sale.amount_paid || 0), 0) || 0;
        const totalDue = totalRevenue - totalCollected;

        setStats({
          totalSales,
          totalRevenue,
          totalCollected,
          totalDue,
          salesData: salesData || []
        });
      } catch (error) {
        console.error('Error fetching seller stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerStats();
  }, [user?.id, business?.id]);

  if (loading) {
    return <SuspenseLoader />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold">Your Sales Performance</h2>
        <p className="text-muted-foreground">Track your sales and collections</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <StatsCard
          title="Total Sales"
          value={stats?.totalSales || 0}
          description="Number of sales made"
        />
        <StatsCard
          title="Total Revenue"
          value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`}
          description="Total sales amount"
        />
        <StatsCard
          title="Amount Collected"
          value={`৳${(stats?.totalCollected || 0).toLocaleString()}`}
          description="Cash received"
        />
        <StatsCard
          title="Amount Due"
          value={`৳${(stats?.totalDue || 0).toLocaleString()}`}
          description="Pending collections"
        />
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={itemVariants}>
        <div className="lg:col-span-2">
          <SalesChart salesData={stats?.salesData || []} />
        </div>
        <div>
          <RecentActivity />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SellerDashboard;