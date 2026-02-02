# Integration Test Plan
**Project:** Bangali Enterprise - Supabase Migration

## Test Scenarios

### 1. Authentication Flow
- [x] **Signup:** Register new user `test_owner@example.com`. Verify `profiles` entry created.
- [x] **Login:** Login with credentials. Verify `session` object in `AuthContext`.
- [x] **Logout:** Ensure session cleared and redirect to login.

### 2. Business Logic
- [x] **Create Business:** Owner creates "Test Shop". Verify `businesses` table.
- [x] **Inventory:** Add product "Rice (50kg)". Check `products` table.
- [x] **Sales:** Create order. Verify stock deduction (if trigger implemented) or manual update.

### 3. Data Isolation (RLS)
- [x] **Scenario:** User A (Business 1) tries to fetch User B (Business 2) products.
- [x] **Expected:** Returns empty array or error.
- [x] **Actual:** Returns empty array (RLS filtered).

### 4. Real-time Updates
- [x] **Scenario:** Open Dashboard in Tab A. Add Product in Tab B.
- [x] **Expected:** Tab A shows toast notification or list update.
- [x] **Actual:** Toast notification received via `RealtimeService`.

### 5. Financials
- [x] **Salaries:** Record salary payment. Verify calculation in Expense Report.
- [x] **Expenses:** Add utility bill. Check Dashboard revenue calculation.

## Manual Testing Checklist
1. Clear Local Storage.
2. Visit `/signup`. Create new account.
3. Complete Onboarding.
4. Add 1 Product.
5. Create 1 Order.
6. Check Dashboard Stats (Should show 1 Order, Revenue > 0).
7. Logout.