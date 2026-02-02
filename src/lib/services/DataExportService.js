import { apiClient } from '@/services/apiClient';
import Papa from 'papaparse';
import { ROLES } from '@/lib/roles';

export const DataExportService = {
  async fetchAll(table, businessId, select = '*', userRole) {
    if (userRole !== ROLES.OWNER) {
      throw new Error('Unauthorized: Only owners can export data.');
    }

    const { data } = await apiClient.get(`/${table}`, { params: { business_id: businessId } });
    return data || [];
  },

  convertToCSV(data) {
    return Papa.unparse(data);
  },

  async exportCustomers(businessId, userRole) {
    const data = await this.fetchAll('customers', businessId, null, userRole);
    return this.convertToCSV(data);
  },

  async exportProducts(businessId, userRole) {
    const data = await this.fetchAll('products', businessId, null, userRole);
    return this.convertToCSV(data);
  },

  async exportSales(businessId, userRole) {
    const data = await this.fetchAll('sales', businessId, null, userRole);
    return this.convertToCSV(data);
  },

  async exportExpenses(businessId, userRole) {
    const data = await this.fetchAll('expenses', businessId, null, userRole);
    return this.convertToCSV(data);
  }
};