
import { supabase } from '@/lib/supabaseClient';
import { isRLSError } from '@/utils/errorHandler';

/**
 * Build a query with common options
 */
export const query = async (table, options = {}) => {
    const { 
        select = '*', 
        filters = {}, 
        order = null, 
        limit = null, 
        page = 0 
    } = options;

    try {
        let queryBuilder = supabase.from(table).select(select, { count: 'exact' });

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryBuilder = queryBuilder.eq(key, value);
            }
        });

        // Apply sorting
        if (order) {
            queryBuilder = queryBuilder.order(order.column, { ascending: order.ascending });
        }

        // Apply pagination
        if (limit) {
            const from = page * limit;
            const to = from + limit - 1;
            queryBuilder = queryBuilder.range(from, to);
        }

        const { data, error, count } = await queryBuilder;
        
        if (error && isRLSError(error)) {
            console.warn(`RLS Error querying ${table}:`, error.message);
            return { data: [], error: { ...error, isRLS: true }, count: 0 };
        }

        return { data, error, count };
    } catch (e) {
        console.error(`Exception querying ${table}:`, e);
        return { data: null, error: e, count: 0 };
    }
};

/**
 * Insert data into a table
 */
export const insert = async (table, data) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select();
        
        if (error && isRLSError(error)) {
             console.warn(`RLS Error inserting into ${table}:`, error.message);
             return { data: null, error: { ...error, isRLS: true } };
        }
        
        return { data: result, error };
    } catch (e) {
        return { data: null, error: e };
    }
};

/**
 * Update data in a table by ID
 */
export const update = async (table, id, data) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select();
        
        if (error && isRLSError(error)) {
             console.warn(`RLS Error updating ${table}:`, error.message);
             return { data: null, error: { ...error, isRLS: true } };
        }
        
        return { data: result, error };
    } catch (e) {
        return { data: null, error: e };
    }
};

/**
 * Delete a row from a table by ID
 */
export const remove = async (table, id) => {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
        
        if (error && isRLSError(error)) {
             console.warn(`RLS Error deleting from ${table}:`, error.message);
             return { error: { ...error, isRLS: true } };
        }
        
        return { error };
    } catch (e) {
        return { error: e };
    }
};

/**
 * Upsert data into a table
 */
export const upsert = async (table, data) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .upsert(data)
            .select();
        
        if (error && isRLSError(error)) {
             console.warn(`RLS Error upserting into ${table}:`, error.message);
             return { data: null, error: { ...error, isRLS: true } };
        }
        
        return { data: result, error };
    } catch (e) {
        return { data: null, error: e };
    }
};
