
import SupabaseService from './SupabaseService';
import { supabase } from './supabaseClient';

class OrderService extends SupabaseService {
  constructor() {
    super('orders');
  }

  async getOrders(businessId) {
    return this.getAll(businessId, { orderBy: 'created_at', ascending: false });
  }

  async getOrderById(businessId, id) {
     const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(name))
      `)
      .eq('business_id', businessId)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createOrder(businessId, orderData) {
     // 1. Create Order
     const { data: order, error } = await supabase
        .from('orders')
        .insert({
            business_id: businessId,
            customer_id: orderData.customer_id,
            total_amount: orderData.total_amount,
            status: 'pending',
            order_number: `ORD-${Date.now()}`,
            notes: orderData.notes
        })
        .select()
        .single();
    
    if (error) throw error;

    // 2. Create Items
    if (orderData.items && orderData.items.length > 0) {
        const items = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.quantity * item.price
        }));

        const { error: itemError } = await supabase.from('order_items').insert(items);
        if (itemError) throw itemError;
    }
    
    return order;
  }

  async updateOrder(businessId, id, data) {
    return this.update(businessId, id, data);
  }

  async updateOrderStatus(businessId, id, status) {
      return this.update(businessId, id, { status });
  }

  async deleteOrder(businessId, id) {
    return this.delete(businessId, id);
  }
}

export const orderService = new OrderService();
