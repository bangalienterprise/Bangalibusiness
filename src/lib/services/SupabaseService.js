
import { mockDatabase } from '@/lib/services/MockDatabase';

/**
 * Data Service (Formerly SupabaseService)
 * 
 * Replaces direct Supabase calls with MockDatabase calls.
 * Maintains the same method signatures for compatibility.
 */

// Helper to format MockDatabase response to look like Supabase response
const handleResponse = async (promise) => {
  try {
    const { data, error } = await promise;
    if (error) throw new Error(error.message);
    return { data, error: null };
  } catch (error) {
    console.error("Data Operation Failed:", error.message);
    return { data: null, error: { message: error.message || "An unexpected error occurred" } };
  }
};

// Helper to validate business ID
const validateBusinessId = (businessId) => {
    if (!businessId) {
        return { valid: false, error: { message: "Business ID is required" } };
    }
    return { valid: true };
};

export const SupabaseService = {
  // --- Products ---
  products: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });
        
        return handleResponse(
            mockDatabase.select('products', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    get: (id) => handleResponse(
      mockDatabase.select('products', { single: true, filters: [{column: 'id', value: id, operator: 'eq'}] })
    ),
    create: (data) => handleResponse(
      mockDatabase.insert('products', data)
    ),
    update: (id, data) => handleResponse(
      mockDatabase.update('products', id, data)
    ),
    delete: (id) => handleResponse(
      mockDatabase.delete('products', id)
    )
  },

  // --- Customers ---
  customers: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('customers', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('customers', data)
    ),
    update: (id, data) => handleResponse(
      mockDatabase.update('customers', id, data)
    ),
    delete: (id) => handleResponse(
      mockDatabase.delete('customers', id)
    )
  },

  // --- Orders ---
  orders: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('orders', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: async (orderData, items) => {
      const { data: order, error } = await mockDatabase.insert('orders', orderData);
      if (error) return { error };

      // Mock order items insertion (MockDB doesn't really have relational integrity, so we just log/skip or store in separate table if exists)
      // For now, we assume the 'orders' object contains everything or we don't track items deeply in mock
      return { data: order, error: null };
    },
    update: (id, data) => handleResponse(
      mockDatabase.update('orders', id, data)
    ),
    delete: (id) => handleResponse(
      mockDatabase.delete('orders', id)
    )
  },

  // --- Sales ---
  sales: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('sales', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('sales', data)
    ),
    update: (id, data) => handleResponse(
      mockDatabase.update('sales', id, data)
    )
  },

  // --- Expenses ---
  expenses: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('expenses', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('expenses', data)
    ),
    update: (id, data) => handleResponse(
      mockDatabase.update('expenses', id, data)
    ),
    delete: (id) => handleResponse(
      mockDatabase.delete('expenses', id)
    )
  },

  // --- Suppliers ---
  suppliers: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('suppliers', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('suppliers', data)
    ),
    update: (id, data) => handleResponse(
      mockDatabase.update('suppliers', id, data)
    ),
    delete: (id) => handleResponse(
      mockDatabase.delete('suppliers', id)
    )
  },

  // --- Salaries ---
  salaries: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('salaries', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('salaries', data)
    ),
    update: (id, data) => handleResponse(
      mockDatabase.update('salaries', id, data)
    )
  },

  // --- Stock ---
  stock: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
           mockDatabase.select('stock', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    add: (data) => handleResponse(
      mockDatabase.insert('stock', data)
    )
  },

  // --- Damages ---
  damages: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('damages', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('damages', data)
    )
  },

  // --- Categories ---
  categories: {
    list: (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return Promise.resolve({ data: null, error: check.error });

        return handleResponse(
            mockDatabase.select('categories', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] })
        );
    },
    create: (data) => handleResponse(
      mockDatabase.insert('categories', data)
    )
  },
  
  // --- Dashboard Stats ---
  dashboard: {
    getStats: async (businessId) => {
        const check = validateBusinessId(businessId);
        if (!check.valid) return { data: null, error: check.error };

        try {
            const { data: orders } = await mockDatabase.select('orders', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] });
            const { data: customers } = await mockDatabase.select('customers', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] });
            const { data: products } = await mockDatabase.select('products', { filters: [{column: 'business_id', value: businessId, operator: 'eq'}] });
            
            const revenue = orders ? orders.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) : 0;

            return { data: { orders: orders.length, customers: customers.length, products: products.length, revenue }, error: null };
        } catch (e) {
            return { data: null, error: e };
        }
    }
  }
};
