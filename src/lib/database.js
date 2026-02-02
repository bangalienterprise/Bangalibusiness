
import { supabase } from '@/lib/customSupabaseClient';
import { supabase as mockSupabase } from '@/lib/supabase';
import { isRLSError } from '@/utils/errorHandler';

// Helper to map API endpoints to table names
const getTableFromUrl = (url) => {
    const path = url.split('?')[0].replace(/^\//, '');
    if (path === 'products') return 'products';
    if (path === 'customers') return 'customers';
    if (path === 'sales') return 'sales';
    if (path === 'orders') return 'orders';
    if (path === 'expenses') return 'expenses';
    if (path === 'suppliers') return 'suppliers';
    if (path === 'collections') return 'collections'; // Assuming a table exists or mapped
    return path;
};

// Wrapper to handle RLS and Auth checks
const wrap = async (operation, url = '', method = 'GET', data = null) => {
  try {
    // 1. Check Auth Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
        console.warn(`Unauthenticated access attempt to ${url}`);
        // We don't block here strictly to allow public endpoints if any, 
        // but we log it. RLS will block if needed.
    }

    // 2. Execute Operation
    const res = await operation();
    
    // 3. Handle RLS / Permission Errors
    if (res.error) {
        if (isRLSError(res.error)) {
            console.warn(`RLS Access Denied on ${url}, attempting fallback to mock data...`);
            
            // Fallback logic for GET requests
            if (method === 'GET') {
                const table = getTableFromUrl(url);
                // Attempt to fetch from mock database
                try {
                    const { data: mockData, error: mockError } = await mockSupabase.from(table).select('*');
                    
                    if (!mockError) {
                        return { 
                            data: mockData, 
                            error: null,
                            isMock: true 
                        };
                    }
                } catch (e) {
                    console.error("Mock fallback failed", e);
                }
            }
            
            return { 
                data: null, 
                error: { 
                    ...res.error, 
                    message: 'Permission denied. You do not have access to this resource.',
                    isRLS: true
                } 
            };
        }
        return { data: null, error: res.error };
    }
    
    return { data: res.data, error: null };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
};

// Generic database operations using Supabase Client directly to ensure Auth headers
export const database = {
  get: (url, conf) => {
      const table = getTableFromUrl(url);
      const params = conf?.params || {};
      let query = supabase.from(table).select('*');
      
      // Apply simple filters from params
      Object.entries(params).forEach(([key, value]) => {
          if (value) query = query.eq(key, value);
      });
      
      return wrap(() => query, url, 'GET');
  },
  create: (url, data) => {
      const table = getTableFromUrl(url);
      return wrap(() => supabase.from(table).insert(data).select().single(), url, 'POST', data);
  },
  update: (url, id, data) => {
      const table = getTableFromUrl(url);
      return wrap(() => supabase.from(table).update(data).eq('id', id).select().single(), url, 'PUT', data);
  },
  remove: (url, id) => {
      const table = getTableFromUrl(url);
      return wrap(() => supabase.from(table).delete().eq('id', id), url, 'DELETE');
  }
};

// --- Products ---
export const getProducts = (bizId) => database.get('/products', { params: { business_id: bizId } });
export const getProduct = (id) => database.get(`/products/${id}`); // Note: get() above needs to handle ID in URL if not using params
export const createProduct = (data) => database.create('/products', data);
export const updateProduct = (id, data) => database.update('/products', id, data);
export const deleteProduct = (id) => database.remove('/products', id);

// --- Product Categories ---
export const createProductCategory = (data) => database.create('/categories', data);
export const updateProductCategory = (id, data) => database.update('/categories', id, data);
export const deleteProductCategory = (id) => database.remove('/categories', id);

// --- Stock ---
export const addStock = (data) => database.create('/stock', data); // Needs table mapping if 'stock' isn't a table
export const adjustStock = (data) => database.create('/stock_adjustments', data);

// --- Customers ---
export const getCustomers = (bizId) => database.get('/customers', { params: { business_id: bizId }});
export const createCustomer = (data) => database.create('/customers', data);
export const updateCustomer = (id, data) => database.update('/customers', id, data);
export const deleteCustomer = (id) => database.remove('/customers', id);

// --- Sales ---
export const getSales = (bizId) => database.get('/sales_transactions', { params: { business_id: bizId }});
export const updateSale = (id, data) => database.update('/sales_transactions', id, data);

// --- Collections ---
export const createCollection = (data) => database.create('/collections', data);
export const updateCollection = (id, data) => database.update('/collections', id, data);
export const deleteCollection = (id) => database.remove('/collections', id);

// --- File Upload ---
export const uploadFile = async (file) => {
    // Mock upload for now, or implement real storage
    await new Promise(r => setTimeout(r, 1000));
    return { url: URL.createObjectURL(file), error: null };
};
