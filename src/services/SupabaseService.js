import { supabase } from './supabaseClient';

class SupabaseService {
  constructor(tableName) {
    this.table = tableName;
  }

  async getAll(businessId, options = {}) {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('business_id', businessId);

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getById(businessId, id) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('business_id', businessId)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(businessId, data) {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert({ ...data, business_id: businessId })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(businessId, id, data) {
    const { data: result, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('business_id', businessId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async delete(businessId, id) {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('business_id', businessId)
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export default SupabaseService;