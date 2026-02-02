# Mock Mode Setup Guide

The application has been configured to run in **Standalone Mock Mode**. This allows you to test all features without a live Supabase backend.

## 1. Demo Credentials
Use these pre-configured accounts in the "Demo Mode Access" panel on the login page:

| Role | Email | Description |
|------|-------|-------------|
| **Admin** | admin@bangali.com | System administrator access |
| **Owner** | owner@bangali.com | Full business management |
| **Manager** | manager@bangali.com | Operational oversight |
| **Seller** | seller@bangali.com | POS and Order management |

**Note:** No password is required when using the Demo Login buttons.

## 2. Mock Data Included
The `src/services/mockData.js` file contains:
- **Businesses:** 4 types (Retail, Agency, Service, Education)
- **Inventory:** 55+ Products across various categories
- **CRM:** 35+ Customer profiles
- **Sales:** 25+ Historical transactions
- **Finance:** Expenses, Salaries, and Collections data

## 3. Testing Features
### A. Sales & Orders
1. Go to **Orders** or **Sales** page.
2. Click "New Order".
3. Select a customer and product (mock data will populate dropdowns).
4. Save. The new order will appear in the list instantly.

### B. Stock Management
1. Go to **Products** or **Stock** page.
2. Edit a product's price or stock.
3. Save changes.
4. Changes persist in local session (refresh to reset if needed, or check `MockDatabase.js` persistence logic).

### C. Dashboard
1. Log in as **Owner**.
2. Verify the charts and stats cards populate with data from `mockOrders` and `mockProducts`.

## 4. Switching Modes
To return to live Supabase mode:
1. Open `.env`
2. Set `VITE_USE_MOCK_DATA=false`
3. Provide valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 5. Troubleshooting
- **Infinite Loading?** Ensure `AuthContext` is using the mock client's `getSession`.
- **Empty Tables?** Check if `mockData.js` is correctly imported in `MockDatabase.js`.
- **Login Fails?** Use the "Demo Mode Access" buttons instead of the form for guaranteed access.