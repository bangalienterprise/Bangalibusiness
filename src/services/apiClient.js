
import { SupabaseService } from '@/lib/services/SupabaseService';
import { supabase as mockSupabase } from '@/lib/supabase';

/**
 * Universal API Client
 * Wraps SupabaseService to maintain consistent API interface
 * Includes fallback to mock data on RLS errors
 */

export const apiClient = {
  // Generic wrapper (legacy support)
  get: async (endpoint, options = {}) => {
     // Parsing endpoint to route to service
     // e.g. /products?business_id=...
     const params = options.params || {};
     const path = endpoint.split('?')[0].replace(/^\//, '');
     
     try {
         if (path === 'products') return await SupabaseService.products.list(params.business_id);
         if (path === 'orders') return await SupabaseService.orders.list(params.business_id);
         if (path === 'sales') return await SupabaseService.sales.list(params.business_id);
         if (path === 'customers') return await SupabaseService.customers.list(params.business_id);
         if (path === 'expenses') return await SupabaseService.expenses.list(params.business_id);
         if (path === 'suppliers') return await SupabaseService.suppliers.list(params.business_id);
         if (path === 'salaries') return await SupabaseService.salaries.list(params.business_id);
         
         // Single Item Getters
         if (path.startsWith('products/')) return await SupabaseService.products.get(path.split('/')[1]);
         if (path.startsWith('orders/')) return await SupabaseService.orders.get(path.split('/')[1]);
     } catch (error) {
         // If SupabaseService throws, we catch it here
         return { data: null, error };
     }

     return { data: [], error: 'Endpoint not implemented in SupabaseService wrapper' };
  },

  post: async (endpoint, body) => {
      const path = endpoint.replace(/^\//, '');
      try {
          if (path === 'products') return await SupabaseService.products.create(body);
          if (path === 'orders') return await SupabaseService.orders.create(body, body.items); // Special case for order items
          if (path === 'customers') return await SupabaseService.customers.create(body);
          if (path === 'sales') return await SupabaseService.sales.create(body);
          if (path === 'expenses') return await SupabaseService.expenses.create(body);
          if (path === 'salaries') return await SupabaseService.salaries.create(body);
      } catch (error) {
          return { data: null, error };
      }
      
      return { data: null, error: 'POST Endpoint not implemented' };
  },

  put: async (endpoint, body) => {
     const parts = endpoint.split('/');
     const resource = parts[1]; // /products/123 -> products
     const id = parts[2];
     
     try {
         if (resource === 'products') return await SupabaseService.products.update(id, body);
         if (resource === 'customers') return await SupabaseService.customers.update(id, body);
         if (resource === 'orders') return await SupabaseService.orders.update(id, body);
     } catch (error) {
         return { data: null, error };
     }

     return { data: null, error: 'PUT Endpoint not implemented' };
  },

  delete: async (endpoint) => {
      const parts = endpoint.split('/');
      const resource = parts[1];
      const id = parts[2];

      try {
          if (resource === 'products') return await SupabaseService.products.delete(id);
          if (resource === 'customers') return await SupabaseService.customers.delete(id);
      } catch (error) {
          return { data: null, error };
      }

      return { data: null, error: 'DELETE Endpoint not implemented' };
  },

  // Specialized Namespaces
  products: SupabaseService.products,
  orders: SupabaseService.orders,
  sales: SupabaseService.sales,
  customers: SupabaseService.customers,
  expenses: SupabaseService.expenses,
  suppliers: SupabaseService.suppliers,
  salaries: SupabaseService.salaries,
  team: SupabaseService.team,
  
  dashboard: SupabaseService.dashboard
};

export default apiClient;
