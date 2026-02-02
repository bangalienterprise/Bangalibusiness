
import SupabaseService from './SupabaseService';

class SupplierService extends SupabaseService {
  constructor() {
    super('suppliers');
  }

  async getSuppliers(businessId) {
    return this.getAll(businessId, { orderBy: 'name' });
  }

  async getSupplierById(businessId, id) {
    return this.getById(businessId, id);
  }

  async createSupplier(businessId, data) {
    return this.create(businessId, data);
  }

  async updateSupplier(businessId, id, data) {
    return this.update(businessId, id, data);
  }

  async deleteSupplier(businessId, id) {
    return this.delete(businessId, id);
  }
}

export const supplierService = new SupplierService();
