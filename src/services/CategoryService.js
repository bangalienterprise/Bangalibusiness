import SupabaseService from './SupabaseService';
import { supabase } from './supabaseClient';

class CategoryService extends SupabaseService {
  constructor() {
    super('categories');
  }

  async getCategories(businessId) {
    return this.getAll(businessId, { orderBy: 'name' });
  }

  async getCategoryById(businessId, id) {
    return this.getById(businessId, id);
  }

  async createCategory(businessId, data) {
    return this.create(businessId, data);
  }

  async updateCategory(businessId, id, data) {
    return this.update(businessId, id, data);
  }

  async deleteCategory(businessId, id) {
    const canDelete = await this.canDeleteCategory(businessId, id);
    if (!canDelete.canDelete) {
        throw new Error(`Cannot delete category. It contains ${canDelete.productCount} products.`);
    }
    return this.delete(businessId, id);
  }

  async getCategoryProducts(businessId, categoryId) {
     // Fetch category name first as products use name for category currently
     const cat = await this.getById(businessId, categoryId);
     if(!cat) return [];
     
     const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('category', cat.name);
     
     if (error) throw error;
     return data;
  }

  async canDeleteCategory(businessId, categoryId) {
      const products = await this.getCategoryProducts(businessId, categoryId);
      return {
          canDelete: products.length === 0,
          productCount: products.length
      };
  }
}

export const categoryService = new CategoryService();