import { supabase } from '@/lib/customSupabaseClient';
import { isRLSError } from '@/utils/errorHandler';

export const dashboardService = {
  async getRetailMetrics(businessId) {
    try {
      if (!businessId) throw new Error("Business ID is required");

      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Parallel queries for efficiency
      // NOTE: Updated to use 'contacts' and 'items' based on V2 schema
      const [salesRes, customersRes, productsRes] = await Promise.all([
        supabase
          .from('sales_transactions')
          .select('total_amount, profit, created_at')
          .eq('business_id', businessId)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('contacts') // Was 'customers'
          .select('id', { count: 'exact', head: true })
          .eq('business_id', businessId)
          //.eq('type', 'customer') // Optional: if you distinguish types
          ,
        supabase
          .from('items') // Was 'products'
          .select('stock_quantity, alert_quantity') // Note: alert_qty vs alert_quantity
          .eq('business_id', businessId)
          .eq('type', 'product')
      ]);

      // Fallback for customers if contacts table fetch fails (legacy support)
      let customerCount = customersRes.count;
      if (customersRes.error) {
           const { count } = await supabase.from('customers').select('id', { count: 'exact', head: true }).eq('business_id', businessId);
           customerCount = count;
      }

      // Fallback for products if items table fetch fails
      let productsData = productsRes.data;
      if (productsRes.error) {
           const { data } = await supabase.from('products').select('stock_quantity, alert_qty').eq('business_id', businessId);
           productsData = data;
      }

      const salesData = salesRes.data || [];
      const products = productsData || [];

      // Calculate Today's stats
      const todaySales = salesData
        .filter(s => s.created_at.startsWith(today))
        .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

      const todayProfit = salesData
        .filter(s => s.created_at.startsWith(today))
        .reduce((sum, s) => sum + (Number(s.profit) || 0), 0);

      // Stock Alerts
      let stockAlerts = 0;
      let outOfStock = 0;
      let lowStock = 0;
      
      products.forEach(p => {
        const stock = p.stock_quantity || 0;
        const alertLvl = p.alert_quantity || p.alert_qty || 10;
        
        if (stock <= 0) outOfStock++;
        else if (stock <= alertLvl) lowStock++;
      });
      stockAlerts = outOfStock + lowStock;

      // Trend Data
      const salesTrend = salesData.map(s => ({
        date: s.created_at.split('T')[0],
        amount: Number(s.total_amount)
      })).reduce((acc, curr) => {
        const existing = acc.find(a => a.date === curr.date);
        if (existing) existing.amount += curr.amount;
        else acc.push({ ...curr });
        return acc;
      }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        todaySales,
        profitEstimate: todayProfit,
        totalCustomers: customerCount || 0,
        stockAlerts,
        outOfStock,
        lowStock,
        salesTrend,
        inventoryHealth: [
          { name: 'In Stock', value: products.length - stockAlerts, fill: '#22c55e' },
          { name: 'Low Stock', value: lowStock, fill: '#f59e0b' },
          { name: 'Out of Stock', value: outOfStock, fill: '#ef4444' }
        ]
      };
    } catch (error) {
      console.error('Retail metrics error:', error);
      return {
        todaySales: 0,
        profitEstimate: 0,
        totalCustomers: 0,
        stockAlerts: 0,
        outOfStock: 0,
        lowStock: 0,
        salesTrend: [],
        inventoryHealth: []
      };
    }
  },

  async getServiceMetrics(businessId) {
     return {
        activeServices: 12,
        appointmentsToday: 5,
        revenueToday: 4500,
        customerRating: 4.8,
        revenueTrend: []
     };
  },

  async getAgencyMetrics(businessId) {
    return {
        activeProjects: 8,
        teamUtilization: 85,
        projectRevenue: 25000,
        clientSatisfaction: 4.9,
        revenueTrend: []
    };
  },

  async getFreelancerMetrics(businessId) {
    return {
        activeProjects: 3,
        totalEarnings: 8500,
        hoursWorked: 32,
        clientRating: 5.0,
        earningsTrend: []
    };
  }
};