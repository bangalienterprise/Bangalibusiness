
import { supabase } from '@/lib/customSupabaseClient';

export const reportService = {
  async getSalesReport(businessId, dateRange) {
    const { from, to } = dateRange || {};
    let query = supabase
      .from('sales_transactions')
      .select('*, customers(name), profiles:sold_by(full_name)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (from) query = query.gte('created_at', from.toISOString());
    if (to) query = query.lte('created_at', to.toISOString());

    const { data, error } = await query;
    if (error) return { error };

    const summary = {
      totalSales: data.reduce((sum, s) => sum + Number(s.total_amount), 0),
      totalProfit: data.reduce((sum, s) => sum + Number(s.profit || 0), 0),
      count: data.length
    };

    return { data, summary, error: null };
  },

  async getInventoryReport(businessId) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), suppliers(name)')
      .eq('business_id', businessId);

    if (error) return { error };

    const summary = {
      totalItems: data.length,
      totalValue: data.reduce((sum, p) => sum + (Number(p.buying_price) * p.stock_quantity), 0),
      lowStock: data.filter(p => p.stock_quantity <= (p.alert_qty || 10)).length
    };

    return { data, summary, error: null };
  },
  
  // Basic stubs for other reports
  async getCustomerReport(businessId) {
      const { data, error } = await supabase.from('customers').select('*').eq('business_id', businessId);
      return { data, summary: { count: data?.length || 0 }, error };
  },

  async getExpenseReport(businessId) {
       const { data, error } = await supabase.from('expenses').select('*').eq('business_id', businessId);
       return { data, summary: { total: data?.reduce((s,e) => s + Number(e.amount), 0) || 0 }, error };
  }
};
