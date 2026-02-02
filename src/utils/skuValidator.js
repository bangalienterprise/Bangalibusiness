
import { supabase } from "@/lib/customSupabaseClient";

/**
 * Checks if a SKU is unique within a business
 * @param {string} businessId 
 * @param {string} sku 
 * @param {string} [excludeProductId] - ID of product to exclude (for updates)
 * @returns {Promise<boolean>} True if unique
 */
export const isSkuUnique = async (businessId, sku, excludeProductId = null) => {
    if (!businessId || !sku) return false;

    try {
        let query = supabase
            .from('products')
            .select('id')
            .eq('business_id', businessId)
            .eq('sku', sku);

        if (excludeProductId) {
            query = query.neq('id', excludeProductId);
        }

        const { data, error } = await query;
        
        if (error) {
            console.error("SKU check error:", error);
            return false;
        }
        
        return data.length === 0;
    } catch (err) {
        console.error("SKU check exception:", err);
        return false;
    }
};
