import { SupabaseService } from '@/lib/services/SupabaseService';

/**
 * ApiService
 * Centralized API service ensuring standardized access to Supabase CRUD operations.
 * Maps high-level actions to specific SupabaseService calls.
 */

export const ApiService = {
  // Authentication methods are handled directly via AuthContext usually, 
  // but we provide wrappers here for completeness if needed.
  
  // --- Business Entities ---
  products: {
    list: (businessId) => SupabaseService.products.list(businessId),
    get: (id) => SupabaseService.products.get(id),
    create: (data) => SupabaseService.products.create(data),
    update: (id, data) => SupabaseService.products.update(id, data),
    delete: (id) => SupabaseService.products.delete(id)
  },

  customers: {
    list: (businessId) => SupabaseService.customers.list(businessId),
    create: (data) => SupabaseService.customers.create(data),
    update: (id, data) => SupabaseService.customers.update(id, data),
    delete: (id) => SupabaseService.customers.delete(id)
  },

  orders: {
    list: (businessId) => SupabaseService.orders.list(businessId),
    create: (data, items) => SupabaseService.orders.create(data, items),
    update: (id, data) => SupabaseService.orders.update(id, data),
    delete: (id) => SupabaseService.orders.delete(id)
  },

  sales: {
    list: (businessId) => SupabaseService.sales.list(businessId),
    create: (data) => SupabaseService.sales.create(data),
    update: (id, data) => SupabaseService.sales.update(id, data)
  },

  expenses: {
    list: (businessId) => SupabaseService.expenses.list(businessId),
    create: (data) => SupabaseService.expenses.create(data),
    update: (id, data) => SupabaseService.expenses.update(id, data),
    delete: (id) => SupabaseService.expenses.delete(id)
  },

  suppliers: {
    list: (businessId) => SupabaseService.suppliers.list(businessId),
    create: (data) => SupabaseService.suppliers.create(data),
    update: (id, data) => SupabaseService.suppliers.update(id, data),
    delete: (id) => SupabaseService.suppliers.delete(id)
  },

  stock: {
    list: (businessId) => SupabaseService.stock.list(businessId),
    add: (data) => SupabaseService.stock.add(data)
  },

  salaries: {
    list: (businessId) => SupabaseService.salaries.list(businessId),
    create: (data) => SupabaseService.salaries.create(data),
    update: (id, data) => SupabaseService.salaries.update(id, data)
  },

  damages: {
    list: (businessId) => SupabaseService.damages.list(businessId),
    create: (data) => SupabaseService.damages.create(data)
  },

  categories: {
    list: (businessId) => SupabaseService.categories.list(businessId),
    create: (data) => SupabaseService.categories.create(data)
  },

  dashboard: {
    getStats: (businessId) => SupabaseService.dashboard.getStats(businessId)
  }
};

export default ApiService;