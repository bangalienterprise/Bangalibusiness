// src/services/MockDatabase.js (Renamed to match imports in other files if needed, but keeping file path as requested)
// Note: Some imports point to 'src/lib/services/MockDatabase.js' in existing code. I will write to the requested location.
// Assuming the user meant 'src/lib/services/MockDatabase.js' based on previous context, but strictly following 'src/services/MockDatabase.js' if that's the instruction.
// However, looking at the provided file list, 'src/lib/services/MockDatabase.js' is the main one. I will use the path from the prompt.
// Prompt says: Update src/services/MockDatabase.js. But codebase shows src/lib/services/MockDatabase.js.
// I will write to src/lib/services/MockDatabase.js to be safe and consistent with previous tasks.

import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, saveToLocalStorage, loadFromLocalStorage } from '@/lib/persistentStorage';

class MockDatabaseService {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    const defaultData = {
      users: [],
      businesses: [],
      products: [],
      categories: [],
      sales: [],
      customers: [], 
      expenses: [],
      expenseCategories: [],
      inviteCodes: []
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

  // --- Auth & User ---
  async login(email, password) {
    const user = this.data.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return user;
  }

  async getUser(id) {
    return this.data.users.find(u => u.id === id);
  }

  async createUser(userData) {
    if (this.data.users.some(u => u.email === userData.email)) throw new Error("User already exists");
    const newUser = { id: this._generateId(), created_at: new Date().toISOString(), permissions: {}, ...userData };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  
  async getTeamMembers(businessId) {
    return this.data.users.filter(u => u.business_id === businessId);
  }

  // --- Business ---
  async createBusiness(businessData) {
    const newBusiness = { id: this._generateId(), created_at: new Date().toISOString(), ...businessData };
    this.data.businesses.push(newBusiness);
    this.save();
    return newBusiness;
  }

  // --- Categories ---
  async getCategories(businessId) {
    return this.data.categories.filter(c => c.business_id === businessId);
  }

  async createCategory(businessId, categoryData) {
    const newCat = {
        id: this._generateId(),
        business_id: businessId,
        created_at: new Date().toISOString(),
        product_count: 0,
        ...categoryData
    };
    if (!this.data.categories) this.data.categories = [];
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  async updateCategory(id, updates) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Category not found");
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data.categories[idx];
  }

  async deleteCategory(id) {
    // Check constraints
    const hasProducts = this.data.products.some(p => p.category_id === id);
    if (hasProducts) throw new Error("Cannot delete category with associated products");
    
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // --- Products ---
  async getProducts(businessId) {
    return this.data.products.filter(p => p.business_id === businessId);
  }

  async createProduct(businessId, productData) {
    if (!this.data.products) this.data.products = [];
    const newProduct = {
        id: this._generateId(),
        business_id: businessId,
        created_at: new Date().toISOString(),
        stock_quantity: 0, // default
        min_stock_alert: 5, // default
        ...productData,
        stock: productData.stock_quantity || productData.stock || 0 // Normalize stock field
    };
    this.data.products.push(newProduct);
    
    // Update category count
    if (newProduct.category_id) {
        const cat = this.data.categories.find(c => c.id === newProduct.category_id);
        if (cat) {
            cat.product_count = (cat.product_count || 0) + 1;
        }
    }
    
    this.save();
    return newProduct;
  }

  async updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    
    // Normalize stock if updated
    if (updates.stock_quantity !== undefined) updates.stock = updates.stock_quantity;
    
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return this.data.products[idx];
  }

  async deleteProduct(id) {
    const product = this.data.products.find(p => p.id === id);
    if (product && product.category_id) {
        const cat = this.data.categories.find(c => c.id === product.category_id);
        if (cat && cat.product_count > 0) cat.product_count--;
    }
    
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    return true;
  }

  async calculateStockValuation(businessId) {
      const products = await this.getProducts(businessId);
      let totalItems = 0;
      let totalCostValue = 0;
      let totalSellingValue = 0;

      products.forEach(p => {
          const qty = Number(p.stock) || 0;
          const cost = Number(p.buying_price) || 0;
          const price = Number(p.selling_price) || 0;
          
          totalItems += qty;
          totalCostValue += (qty * cost);
          totalSellingValue += (qty * price);
      });

      const potentialProfit = totalSellingValue - totalCostValue;
      const profitMargin = totalSellingValue > 0 ? (potentialProfit / totalSellingValue) * 100 : 0;

      return {
          totalItems,
          totalCostValue,
          totalSellingValue,
          potentialProfit,
          profitMargin
      };
  }

  // --- Expenses ---
  async getExpenses(businessId) {
    if (!this.data.expenses) return [];
    return this.data.expenses.filter(e => e.business_id === businessId);
  }

  async createExpense(businessId, expenseData) {
    if (!this.data.expenses) this.data.expenses = [];
    const newExpense = {
        id: this._generateId(),
        business_id: businessId,
        created_at: new Date().toISOString(),
        ...expenseData
    };
    this.data.expenses.push(newExpense);
    this.save();
    return newExpense;
  }

  async deleteExpense(id) {
      this.data.expenses = this.data.expenses.filter(e => e.id !== id);
      this.save();
      return true;
  }
  
  async getExpenseCategories(businessId) {
      if (!this.data.expenseCategories) return [];
      return this.data.expenseCategories.filter(c => c.business_id === businessId);
  }

  async createExpenseCategory(businessId, data) {
      if (!this.data.expenseCategories) this.data.expenseCategories = [];
      const newCat = { id: this._generateId(), business_id: businessId, ...data };
      this.data.expenseCategories.push(newCat);
      this.save();
      return newCat;
  }

  async getTotalExpenses(businessId, month, year) {
      const expenses = await this.getExpenses(businessId);
      return expenses.reduce((sum, exp) => {
          const d = new Date(exp.expense_date);
          if (d.getMonth() === month && d.getFullYear() === year) {
              return sum + Number(exp.amount);
          }
          return sum;
      }, 0);
  }

  // --- Dashboard Calculations ---
  async getTotalSales(businessId, month, year) {
      const sales = this.data.sales.filter(s => s.business_id === businessId);
      return sales.reduce((sum, sale) => {
          const d = new Date(sale.date);
          if (d.getMonth() === month && d.getFullYear() === year) {
              return sum + Number(sale.total);
          }
          return sum;
      }, 0);
  }

  async getTotalCOGS(businessId, month, year) {
      const sales = this.data.sales.filter(s => s.business_id === businessId);
      return sales.reduce((sum, sale) => {
          const d = new Date(sale.date);
          if (d.getMonth() === month && d.getFullYear() === year) {
              return sum + (Number(sale.cost_amount) || 0);
          }
          return sum;
      }, 0);
  }

  // Generic helpers from previous impl
  async getAll(collection, businessId) {
      if (!this.data[collection]) return [];
      if (businessId) return this.data[collection].filter(i => i.business_id === businessId);
      return this.data[collection];
  }
  
  async create(collection, data) {
      if (!this.data[collection]) this.data[collection] = [];
      const item = { id: this._generateId(), created_at: new Date().toISOString(), ...data };
      this.data[collection].push(item);
      this.save();
      return item;
  }
}

// Write to the location used in imports: src/lib/services/MockDatabase.js
export const mockDatabase = new MockDatabaseService();