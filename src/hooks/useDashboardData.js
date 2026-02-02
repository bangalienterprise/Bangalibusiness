
import React, { useState, useEffect } from 'react';
import { ApiService } from '@/services/ApiService';
import { useBusiness } from '@/contexts/BusinessContext';

/**
 * useDashboardData
 * Hook to provide real-time dashboard statistics and data
 */
export const useDashboardData = () => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?.id;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ 
      revenue: 0, 
      orders: 0, 
      customers: 0, 
      products: 0 
  });
  const [loading, setLoading] = useState(true);

  // Sub-hooks for compatibility with existing components
  const useOrders = () => {
    return { data: orders, loading };
  };

  const useProducts = () => {
    return { data: products, loading };
  };

  const useStats = () => {
     return { stats, loading };
  };

  useEffect(() => {
    if (!businessId) {
        setLoading(false);
        return;
    }

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Statistics via dashboard endpoint which is optimized
            const statsRes = await ApiService.dashboard.getStats(businessId);
            if (statsRes.data) setStats(statsRes.data);

            // Fetch recent orders for table
            const ordersRes = await ApiService.orders.list(businessId);
            if (ordersRes.data) setOrders(ordersRes.data.slice(0, 5)); // Just top 5

            // Fetch top products
            // Ideally backend does sorting, we'll slice here for now
            const prodRes = await ApiService.products.list(businessId);
            if (prodRes.data) setProducts(prodRes.data.slice(0, 5));

        } catch (e) {
            console.error("Dashboard data load error", e);
        } finally {
            setLoading(false);
        }
    };

    loadData();
  }, [businessId]);

  return { useOrders, useProducts, useStats };
};
