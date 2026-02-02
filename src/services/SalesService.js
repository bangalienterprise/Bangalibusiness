import SupabaseService from './SupabaseService';
import { supabase } from './supabaseClient';

class SalesService extends SupabaseService {
  constructor() {
    super('sales_transactions'); // Using sales_transactions table for Retail Sales
  }

  async getSales(businessId) {
    return this.getAll(businessId, { orderBy: 'created_at', ascending: false });
  }

  async getSaleById(businessId, saleId) {
    const { data, error } = await supabase
      .from('sales_transactions')
      .select(`
        *,
        items:sales_items(*)
      `)
      .eq('business_id', businessId)
      .eq('id', saleId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createSale(businessId, saleData) {
    // 1. Generate Invoice Number (Simple timestamp based for now)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    // 2. Create Transaction
    const transactionData = {
      business_id: businessId,
      invoice_number: invoiceNumber,
      customer_id: saleData.customer_id,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      total_amount: saleData.total,
      payment_method: saleData.payment_method,
      status: 'completed',
      served_by: saleData.served_by
    };

    const { data: transaction, error: transError } = await supabase
      .from('sales_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transError) throw transError;

    // 3. Create Sale Items
    if (saleData.items && saleData.items.length > 0) {
      const itemsToInsert = saleData.items.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.quantity * item.price
      }));

      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 4. Update Stock (Ideally via RPC/Database Function, but doing client-side for now per instructions)
      for (const item of saleData.items) {
        if (item.product_id) {
           await this.decrementStock(item.product_id, item.quantity);
        }
      }
    }

    // 5. Update Customer Due if partial payment (Not fully implemented in UI yet, but placeholder logic)
    if (saleData.amount_paid < saleData.total && saleData.customer_id) {
       const due = saleData.total - saleData.amount_paid;
       await this.updateCustomerDue(saleData.customer_id, due);
    }

    return transaction;
  }

  async decrementStock(productId, quantity) {
    // This is naive and prone to race conditions. 
    // In production, use a postgres function: decrement_stock(id, qty)
    const { data: product } = await supabase.from('products').select('stock_qty').eq('id', productId).single();
    if (product) {
      await supabase
        .from('products')
        .update({ stock_qty: product.stock_qty - quantity })
        .eq('id', productId);
    }
  }

  async updateCustomerDue(customerId, amount) {
     const { data: customer } = await supabase.from('customers').select('current_due').eq('id', customerId).single();
     if (customer) {
       await supabase
         .from('customers')
         .update({ current_due: (customer.current_due || 0) + amount })
         .eq('id', customerId);
     }
  }

  async updateSale(businessId, saleId, saleData) {
    return this.update(businessId, saleId, saleData);
  }

  async deleteSale(businessId, saleId) {
    return this.delete(businessId, saleId);
  }

  async getSalesByDateRange(businessId, startDate, endDate) {
    const { data, error } = await supabase
      .from('sales_transactions')
      .select('*')
      .eq('business_id', businessId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    if (error) throw error;
    return data;
  }

  async getTotalSales(businessId, month, year) {
    // Start of month
    const start = new Date(year, month, 1).toISOString();
    // End of month
    const end = new Date(year, month + 1, 0).toISOString();

    const { data, error } = await supabase
      .from('sales_transactions')
      .select('total_amount')
      .eq('business_id', businessId)
      .gte('created_at', start)
      .lte('created_at', end);

    if (error) throw error;
    
    return data.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0);
  }
}

export const salesService = new SalesService();