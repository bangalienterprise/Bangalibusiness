import { mockDatabase } from '@/lib/services/MockDatabase';
import { v4 as uuidv4 } from 'uuid';

export const initializeMockData = async () => {
    // Check if data exists to avoid overwriting
    const existingProducts = await mockDatabase.getAll('products');
    if (existingProducts.length > 0) {
        console.log("Mock data already exists. Skipping initialization.");
        return;
    }

    console.log("Seeding Mock Data...");

    // --- 1. Retail Business Setup ---
    const retailBiz = await mockDatabase.createBusiness({ 
        name: "Super Mart", 
        type: "retail", 
        code: "RETAIL-88" 
    });
    
    const businessId = retailBiz.id;

    // --- 2. Users ---
    const owner = await mockDatabase.createUser({
        email: "owner@retail.com",
        password: "Owner@123",
        full_name: "Retail Owner",
        role: "owner",
        business_type: "retail",
        business_id: businessId,
        permissions: { CAN_SEE_COST: true, CAN_MANAGE_TEAM: true, CAN_OVERRIDE_PRICE: true, CAN_DELETE_INVOICES: true, CAN_EDIT_SETTINGS: true }
    });

    const manager = await mockDatabase.createUser({
        email: "manager@retail.com",
        password: "Manager@123",
        full_name: "Store Manager",
        role: "manager",
        business_type: "retail",
        business_id: businessId,
        permissions: { CAN_SEE_COST: false, CAN_MANAGE_TEAM: true, CAN_OVERRIDE_PRICE: false, CAN_DELETE_INVOICES: false, CAN_EDIT_SETTINGS: false }
    });

    const seller = await mockDatabase.createUser({
        email: "seller@retail.com",
        password: "Seller@123",
        full_name: "Sales Person",
        role: "seller",
        business_type: "retail",
        business_id: businessId,
        permissions: { CAN_SEE_COST: false }
    });

    // --- 3. Categories ---
    const categoriesData = [
        { name: "Groceries", description: "Daily essentials" },
        { name: "Beverages", description: "Drinks and liquids" },
        { name: "Snacks", description: "Chips, biscuits, and quick eats" },
        { name: "Dairy", description: "Milk, cheese, yogurt" },
        { name: "Spices", description: "Cooking spices and herbs" }
    ];

    const categories = [];
    for (const cat of categoriesData) {
        const newCat = await mockDatabase.createCategory(businessId, cat);
        categories.push(newCat);
    }

    // --- 4. Products ---
    const specificProducts = [
        { name: "Rice", unit_type: "kg", buying_price: 30, selling_price: 50, stock: 100, min_stock_alert: 20, category: "Groceries" },
        { name: "Oil", unit_type: "liter", buying_price: 80, selling_price: 120, stock: 50, min_stock_alert: 10, category: "Groceries" },
        { name: "Sugar", unit_type: "kg", buying_price: 40, selling_price: 60, stock: 75, min_stock_alert: 15, category: "Groceries" },
        { name: "Tea", unit_type: "pcs", buying_price: 5, selling_price: 10, stock: 200, min_stock_alert: 50, category: "Beverages" },
        { name: "Coffee", unit_type: "pcs", buying_price: 8, selling_price: 15, stock: 150, min_stock_alert: 30, category: "Beverages" },
        { name: "Milk", unit_type: "liter", buying_price: 30, selling_price: 50, stock: 80, min_stock_alert: 10, category: "Dairy" },
        { name: "Eggs", unit_type: "dozen", buying_price: 60, selling_price: 100, stock: 30, min_stock_alert: 5, category: "Dairy" },
        { name: "Bread", unit_type: "pcs", buying_price: 20, selling_price: 35, stock: 100, min_stock_alert: 15, category: "Snacks" },
        { name: "Honey", unit_type: "kg", buying_price: 200, selling_price: 350, stock: 10, min_stock_alert: 2, category: "Groceries" },
        { name: "Spices Mix", unit_type: "kg", buying_price: 100, selling_price: 200, stock: 20, min_stock_alert: 5, category: "Spices" }
    ];

    // Helper to find category ID
    const getCatId = (name) => categories.find(c => c.name === name)?.id || categories[0].id;

    for (let i = 0; i < specificProducts.length; i++) {
        const p = specificProducts[i];
        await mockDatabase.createProduct(businessId, {
            ...p,
            sku: `PROD-${1000 + i}`,
            category_id: getCatId(p.category),
            stock_quantity: p.stock // Mapping to internal schema
        });
    }

    // Generate 40 more random products
    const units = ['pcs', 'kg', 'box', 'liter'];
    for (let i = 0; i < 40; i++) {
        const catIndex = i % categories.length;
        const cost = Math.floor(Math.random() * 500) + 10;
        await mockDatabase.createProduct(businessId, {
            name: `Product ${i + 11}`,
            sku: `GEN-${2000 + i}`,
            unit_type: units[i % 4],
            buying_price: cost,
            selling_price: Math.floor(cost * 1.5),
            stock_quantity: Math.floor(Math.random() * 100),
            min_stock_alert: 10,
            category_id: categories[catIndex].id,
            category: categories[catIndex].name // Legacy support
        });
    }

    // --- 5. Expenses ---
    const expenseCategoriesData = ["Rent", "Utilities", "Salaries", "Maintenance", "Inventory"];
    const expenseCategories = [];
    for (const name of expenseCategoriesData) {
        const cat = await mockDatabase.createExpenseCategory(businessId, { name });
        expenseCategories.push(cat);
    }

    // Create some expenses
    for (let i = 0; i < 15; i++) {
        const cat = expenseCategories[i % 5];
        await mockDatabase.createExpense(businessId, {
            description: `Expense record ${i+1}`,
            amount: Math.floor(Math.random() * 5000) + 500,
            category_id: cat.id,
            category_name: cat.name,
            expense_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            paid_by: owner.id
        });
    }

    // --- 6. Sales for Dashboard ---
    // Generate sales for the last 30 days
    for (let i = 0; i < 50; i++) {
        const total = Math.floor(Math.random() * 2000) + 100;
        const cost = total * 0.7; // Approx cost
        await mockDatabase.create('sales', {
            business_id: businessId,
            processed_by: owner.id,
            total: total,
            subtotal: total,
            cost_amount: cost, // For COGS calculation
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            payment_method: 'Cash',
            items: [] 
        });
    }

    console.log("Mock Data Initialization Complete.");
};