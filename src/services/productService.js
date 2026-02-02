
import { supabase } from "@/lib/customSupabaseClient";
import { supabase as mockSupabase } from "@/lib/supabase";

export const productService = {
    async getProductsByBusiness(businessId) {
        if (!businessId) return { data: [], error: 'No business ID' };

        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category_name:categories(name),
                supplier_name:suppliers(name)
            `)
            .eq('business_id', businessId);

        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            console.warn("RLS: Access denied to products, using mock");
            return await mockSupabase.from('products').select('*').eq('business_id', businessId);
        }

        return { data, error };
    },

    async createProduct(businessId, productData) {
        const { data, error } = await supabase
            .from('products')
            .insert({ ...productData, business_id: businessId })
            .select()
            .single();
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('products').insert({ ...productData, business_id: businessId }).select().single();
        }
        return { data, error };
    },

    async updateProduct(businessId, productId, productData) {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', productId)
            .eq('business_id', businessId)
            .select()
            .single();
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('products').update(productData).eq('id', productId).select().single();
        }
        return { data, error };
    },

    async deleteProduct(businessId, productId) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)
            .eq('business_id', businessId);
            
        if (error && (error.code === '42501' || error.message?.includes('permission denied'))) {
            return await mockSupabase.from('products').delete().eq('id', productId);
        }
        return { error };
    }
};
