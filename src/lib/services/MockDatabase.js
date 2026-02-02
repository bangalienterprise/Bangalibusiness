
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, saveToLocalStorage, loadFromLocalStorage } from '@/lib/persistentStorage';

class MockDatabaseService {
  constructor() {
    this.data = this.loadData();
    this._ensureCommissionData();
  }

  loadData() {
    const defaultData = {
      users: [],
      businesses: [],
      products: [],
      sales: [],
      projects: [],
      clients: [],
      customers: [], 
      students: [],
      courses: [],
      appointments: [],
      invoices: [],
      time_logs: [],
      staff: [],
      services: [],
      milestones: [],
      inviteCodes: [],
      expenses: [],
      settings: [],
      profiles: [], // Added profiles table
      business_users: [] // Added business_users table
    };
    
    const stored = loadFromLocalStorage(STORAGE_KEYS.DB_DATA);
    return stored || defaultData;
  }

  save() {
    saveToLocalStorage(STORAGE_KEYS.DB_DATA, this.data);
  }

  _generateId() {
    return uuidv4();
  }

  _ensureCommissionData() {
    // Migration: Add commission fields to existing users if missing
    let updated = false;
    if (this.data.users) {
      this.data.users.forEach(user => {
        if (typeof user.commission_percentage === 'undefined') {
          user.commission_percentage = user.role === 'seller' ? 5 : 0;
          user.commission_type = 'percentage';
          user.is_active_commission = true;
          user.commission_start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          updated = true;
        }
      });
    }
    if (updated) this.save();
  }

  // --- Generic Query Methods ---

  async select(table, query = {}) {
    let data = await this.getAll(table);
    
    // Apply filters
    if (query.filters) {
      for (const filter of query.filters) {
        if (filter.operator === 'eq') {
          data = data.filter(item => item[filter.column] === filter.value);
        }
        // Add other operators if needed
      }
    }

    // Apply ordering
    if (query.order) {
      const { column, ascending } = query.order;
      data.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (query.limit) {
      data = data.slice(0, query.limit);
    }

    // Apply single
    if (query.single) {
      if (data.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' } };
      }
      return { data: data[0], error: null };
    }

    return { data, error: null };
  }

  async insert(table, data) {
    // Handle array or single object
    if (Array.isArray(data)) {
        const results = [];
        for (const item of data) {
            results.push(await this.create(table, item));
        }
        return { data: results, error: null };
    } else {
        const result = await this.create(table, data);
        return { data: result, error: null };
    }
  }

  // --- Auth & User ---
  async login(email, password) {
    const user = this.data.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return user;
  }

  async getUser(idOrEmail) {
    return this.data.users.find(u => u.id === idOrEmail || u.email === idOrEmail);
  }

  async createUser(userData) {
    const existing = this.data.users.find(u => u.email === userData.email);
    if (existing) throw new Error("User already exists");

    // Default Commission Settings based on Role
    let defaultCommission = {
        commission_percentage: 0,
        commission_type: 'percentage',
        is_active_commission: true,
        commission_amount: 0,
        commission_start_date: new Date().toISOString()
    };

    if (userData.role === 'seller') {
        defaultCommission.commission_percentage = 5;
    }

    const newUser = {
      id: this._generateId(),
      created_at: new Date().toISOString(),
      permissions: {}, 
      ...defaultCommission,
      ...userData
    };
    
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  
  async updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");
    
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    return this.data.users[index];
  }

  async updateUserPermissions(userId, permissions) {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      user.permissions = { ...user.permissions, ...permissions };
      this.save();
      return user;
  }

  async getUserPermissions(userId) {
      const user = await this.getUser(userId);
      return user?.permissions || {};
  }

  async getTeamMembers(businessId) {
    return this.data.users.filter(u => u.business_id === businessId);
  }
  
  async getActiveSellers(businessId) {
      return this.getTeamMembers(businessId); // Simplified for mock
  }

  // --- Commission Operations ---
  async updateUserCommission(userId, commissionData) {
    return this.updateUser(userId, commissionData);
  }

  async getCommissionHistory(userId, startDate, endDate) {
    let sales = await this.getSalesBySeller(userId);
    if (startDate) {
        sales = sales.filter(s => new Date(s.created_at) >= new Date(startDate));
    }
    if (endDate) {
        sales = sales.filter(s => new Date(s.created_at) <= new Date(endDate));
    }
    // Only return sales with commission info
    return sales.filter(s => s.commission_amount > 0);
  }

  // --- Settings ---
  async getSettings(businessId) {
    if (!this.data.settings) this.data.settings = [];
    let settings = this.data.settings.find(s => s.business_id === businessId);
    
    if (!settings) {
      settings = {
        id: this._generateId(),
        business_id: businessId,
        general_info: { store_name: "My Store", phone: "", address: "" },
        sales_tax: { tax_rate: 0, currency_symbol: "৳", enable_tax: false },
        invoice: { invoice_prefix: "INV-", paper_size: "Thermal" },
        backup: { last_backup_date: null }
      };
      this.data.settings.push(settings);
      this.save();
    }
    return settings;
  }

  async updateSettings(businessId, newSettings) {
    const index = this.data.settings.findIndex(s => s.business_id === businessId);
    if (index === -1) {
       await this.getSettings(businessId);
       return this.updateSettings(businessId, newSettings);
    }
    
    // Deep merge simulation
    this.data.settings[index] = { 
        ...this.data.settings[index], 
        ...newSettings,
        general_info: { ...this.data.settings[index].general_info, ...(newSettings.general_info || {}) },
        sales_tax: { ...this.data.settings[index].sales_tax, ...(newSettings.sales_tax || {}) },
        invoice: { ...this.data.settings[index].invoice, ...(newSettings.invoice || {}) },
    };
    
    this.save();
    return this.data.settings[index];
  }

  // --- Business ---
  async createBusiness(businessData) {
    const newBusiness = {
      id: this._generateId(),
      created_at: new Date().toISOString(),
      ...businessData
    };
    this.data.businesses.push(newBusiness);
    this.save();
    return newBusiness;
  }

  async getBusiness(id) {
    return this.data.businesses.find(b => b.id === id);
  }

  // --- Sales & Retail ---
  async getSalesByUser(userId) {
      return this.data.sales.filter(s => s.processed_by === userId);
  }

  async getSalesBySeller(sellerId) {
      return this.data.sales.filter(s => s.sold_by === sellerId);
  }

  async getRetailStats(businessId) {
      const products = await this.getAll('products', businessId);
      const sales = await this.getAll('sales', businessId);
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      return { totalRevenue, totalOrders: sales.length, productsCount: products.length };
  }

  async create(collection, data) {
    if (!this.data[collection]) this.data[collection] = [];
    const newItem = {
      id: data.id || this._generateId(),
      created_at: new Date().toISOString(),
      ...data
    };
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  async getAll(collection, businessId) {
    if (!this.data[collection]) return [];
    if (businessId) {
      return this.data[collection].filter(item => item.business_id === businessId);
    }
    return this.data[collection];
  }

  async update(collection, id, updates) {
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) throw new Error("Item not found");
    this.data[collection][index] = { ...this.data[collection][index], ...updates };
    this.save();
    return this.data[collection][index];
  }
  
  async delete(collection, id) {
     const index = this.data[collection].findIndex(item => item.id === id);
     if (index === -1) throw new Error("Item not found");
     this.data[collection].splice(index, 1);
     this.save();
     return true;
  }

  // Invite codes (abbreviated for brevity as focusing on commissions/settings)
  async validateInviteCode(code) { return { valid: false }; }
  async createInviteCode() { return {}; }
  async incrementCodeUsage() {}
  async factoryReset(businessId) {
      this.data.sales = this.data.sales.filter(s => s.business_id !== businessId);
      this.save();
  }
  async exportData(businessId) { return { sales: [], products: [] }; }
}

export const mockDatabase = new MockDatabaseService();
