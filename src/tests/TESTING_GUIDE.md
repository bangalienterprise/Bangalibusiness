
# Comprehensive Manual Testing Guide

This document outlines a comprehensive manual testing process for the Bangali Enterprise application. It covers various aspects including authentication, dashboard functionalities, module-specific features, role-based access control, error handling, performance, and browser compatibility.

## 1. Authentication Testing

### Objective:
Verify user authentication flows are secure and functional.

### Test Cases:
*   **User Signup:**
    *   Create New Business:
        *   Verify all 4 steps (Account Type, Personal/Account Details, Business Type, Business Details) complete successfully.
        *   Validate password strength indicator and requirements.
        *   Ensure email uniqueness (attempt to sign up with existing email, verify error).
        *   Successful redirection to dashboard after signup.
        *   Verify new user and business entry in Supabase.
    *   Join Existing Business:
        *   Verify all 4 steps (Account Type, Personal/Account Details, Invite Code entry) complete successfully.
        *   Validate invite code (valid, expired, invalid code, verify error messages).
        *   Successful redirection to dashboard after accepting invite.
        *   Verify new user linked to business in `business_users` and `profiles` tables.
*   **User Login:**
    *   Successful login with valid credentials (email, password).
    *   Unsuccessful login with invalid credentials (wrong email/password, verify error messages).
    *   Verify session persistence (remain logged in after browser close/reopen).
    *   Verify redirection to dashboard upon successful login.
*   **User Logout:**
    *   Successful logout from any page.
    *   Verify redirection to login page after logout.
    *   Verify session termination (cannot access protected routes after logout).
*   **Invite Code Management:**
    *   Validate a generated invite code (check expiry, status, associated business/role).
    *   Accept an invite code (ensure user is linked to business and invite status updates).

## 2. Dashboard Testing

### Objective:
Verify all dashboard types display correct data and functionality based on business type.

### Test Cases:
*   **Retail Dashboard (`/retail/dashboard`):**
    *   **KPI Cards:** Verify Today's Sales, Est. Profit (owner/manager only), Total Customers, Stock Alerts display accurate, real-time data.
    *   **Charts:** Verify Sales Trend (30 days), Revenue Trend, Top Products, Inventory Health (donut chart) render correctly with relevant data.
    *   **Quick Actions:** Verify buttons (POS, Products, Orders, Expenses, Team, Settings) navigate to correct pages.
    *   **Recent Activity:** Verify latest sales/orders/expenses are displayed (if implemented).
*   **Service Dashboard (`/service/dashboard` - Placeholder):**
    *   Verify basic structure loads. (Placeholder content if not fully implemented).
*   **Agency Dashboard (`/agency/dashboard` - Placeholder):**
    *   Verify basic structure loads. (Placeholder content if not fully implemented).
*   **Freelancer Dashboard (`/freelancer/dashboard` - Placeholder):**
    *   Verify basic structure loads. (Placeholder content if not fully implemented).
*   **Other Business Dashboard (`/other/dashboard` - Placeholder):**
    *   Verify basic structure loads. (Placeholder content if not fully implemented).

## 3. Module Testing

### Objective:
Verify all core business modules are fully functional and adhere to role-based access.

### Test Cases:
*   **POS (`/retail/pos`):**
    *   **Product Search:** Search by name/SKU, verify results.
    *   **Cart Management:** Add/remove items, adjust quantities, apply discounts/taxes.
    *   **Total Calculation:** Verify total amount, paid, due are calculated correctly.
    *   **Payment:** Select payment methods (Cash, Card, Check, Due), process sale.
    *   **Receipt:** Verify receipt generation and content.
    *   **Stock Update:** Confirm product stock updates after sale.
    *   **Error Handling:** Invalid cart, payment failure, stock issues.
*   **Sales History (`/retail/sales-history`):**
    *   **Table Display:** Verify Date, Customer, Amount, Sold By, Payment Method, Status.
    *   **Filters:** Filter by date, customer, sold by, payment method.
    *   **Actions:** View details, edit (owner/manager only), delete (owner/manager only), print receipt.
*   **Due Collection (`/retail/due-collection`):**
    *   **Table Display:** Verify Name, Phone, Due Amount, Last Sale Date for customers.
    *   **Actions:** View details, Record Payment (modal interaction), Edit (owner/manager only), Delete (owner/manager only).
    *   **Record Payment:** Confirm payment updates customer due and reflects in sales.
*   **Products (`/retail/products`):**
    *   **Table Display:** Verify SKU, Name, Category, Stock, Cost (owner/manager only), Price, Profit Margin.
    *   **Actions:** View details, Edit (owner/manager only), Delete (owner/manager only).
    *   **Add Product:** Verify form submission and new product creation.
    *   **Filters:** By category, stock status (low/out), search by name/SKU.
*   **Categories (`/retail/categories`):**
    *   **List Display:** Verify Name, Description, Product Count.
    *   **Actions:** Edit (owner/manager only), Delete (owner/manager only).
    *   **Add Category:** Verify form submission and new category creation.
*   **Expenses (`/retail/expenses`):**
    *   **Table Display:** Verify Date, Category, Amount, Reason, Created By.
    *   **Actions:** Edit (owner/manager only), Delete (owner/manager only).
    *   **Add Expense:** Verify form submission and new expense creation.
    *   **Filters:** By date range, category, amount.
    *   **Summary:** Verify total expenses calculation.
*   **Damage Reports (`/retail/damage-reports`):**
    *   **Table Display:** Verify Date, Product, Quantity, Reason, Created By.
    *   **Actions:** Edit (owner/manager only), Delete (owner/manager only).
    *   **Add Damage:** Verify form submission, product selection, quantity, reason.
    *   **Stock Update:** Confirm product stock decreases after damage report.
*   **Gift Cards (`/retail/gift-cards`):**
    *   **Table Display:** Verify Code, Value, Balance, Expiry, Status.
    *   **Actions:** View details, Edit (owner/manager only), Delete (owner/manager only).
    *   **Create Gift Card:** Verify code generation, value, expiry.
    *   **POS Integration:** Apply gift card to a sale, verify balance update and status change.
*   **Orders (`/retail/orders`):**
    *   **Table Display:** Verify Order ID, Customer, Total, Status, Created Date.
    *   **Actions:** View details, Edit (owner/manager only), Delete (owner/manager only).
    *   **Create Order:** (If implemented) Verify order creation flow.
    *   **Filters:** By status, customer, date range.
*   **Suppliers (`/retail/suppliers`):**
    *   **Table Display:** Verify Name, Phone, Email, Balance.
    *   **Actions:** View details, Edit (owner/manager only), Delete (owner/manager only).
    *   **Add Supplier:** Verify form submission and new supplier creation.
*   **Team (`/retail/team`):**
    *   **Table Display:** Verify Name, Email, Role, Joined Date.
    *   **Actions:** Edit Role (owner only), Remove (owner only).
    *   **Add Team Member:** Verify invite process (email, role selection, code generation, email sending).
*   **Settings (`/retail/settings`):**
    *   **Tabs:** Verify all tabs (General, Business, Tax & Invoice, Notifications, Data & Export) load correctly.
    *   **Form Fields:** Verify all input fields display current settings and allow modification.
    *   **Save Functionality:** Verify changes are saved and persist.
    *   **Data & Export (owner only):** Verify export buttons (Sales, Customers, Products, Expenses, All Data) trigger file downloads.
    *   **Delete All Data (owner only):** Test with caution, confirm warning, verify data deletion.

## 4. Feature Testing

### Objective:
Verify all cross-cutting features are functional and provide a consistent user experience.

### Test Cases:
*   **Reports (`/retail/reports`):**
    *   **Tabs:** Verify all report tabs (Sales, Inventory, Customer, Expense, Team) load correctly.
    *   **Filters:** Test date range, status, type filters for each report.
    *   **Data Display:** Verify tables and charts display accurate report data.
    *   **Export:** Test `Export to CSV` functionality for each report.
*   **Notifications:**
    *   **Bell Icon:** Verify unread count badge updates.
    *   **Dropdown:** Verify notifications display correctly (icon, title, message, time).
    *   **Actions:** Mark as read, Clear all.
    *   **Real-time:** Trigger events (e.g., low stock, new sale) and verify real-time notification appearance.
    *   **Notifications Page:** Verify full list, filters, mark all/delete all functionality.
*   **Help (`/help`):**
    *   **Sections:** Verify all help sections (Getting Started, Dashboard Guide, etc.) load.
    *   **FAQ:** Test collapsible FAQ items.
    *   **Search:** Search for keywords and verify relevant results.
    *   **Contact Form:** Submit form (verify toast message).
*   **Dark Mode Toggle:**
    *   Toggle between dark and light mode.
    *   Verify entire UI theme changes correctly.
    *   Verify preference persists across sessions (localStorage).
    *   Verify system preference detection.
*   **Responsive Design:**
    *   Test all pages and modules on various screen sizes (desktop, tablet, mobile).
    *   Verify layout adjusts correctly, elements are accessible and readable.
    *   Test sidebar collapse/expand on mobile.

## 5. Role-Based Access Testing (RBAC)

### Objective:
Verify that user permissions are correctly enforced based on their assigned roles.

### Test Accounts:
*   **Owner:** Full access to all features.
*   **Manager:** Access to most operational features, limited administrative.
*   **Seller:** Access primarily to sales-related features, view-only on others.

### Test Cases (for each role):
*   **Dashboard KPIs:**
    *   Owner: All KPIs visible.
    *   Manager: All KPIs visible except certain owner-only stats.
    *   Seller: Only sales-related KPIs visible.
*   **Quick Actions:**
    *   Owner/Manager: All Quick Actions visible.
    *   Seller: Only POS, Products (view), Sales History, Due Collection.
*   **Module Actions (e.g., Products Page):**
    *   Owner: Can Add, Edit, Delete products. Cost/Profit visible.
    *   Manager: Can Add, Edit products. Cost/Profit visible. Cannot Delete.
    *   Seller: View-only products. Cost/Profit hidden. Cannot Add/Edit/Delete.
*   **Team Management Page:**
    *   Owner: Full access (add, edit role, remove).
    *   Manager: View-only team members. Cannot add, edit roles, or remove.
    *   Seller: No access or limited view of own profile.
*   **Settings Page:**
    *   Owner: Full access to all tabs and save options.
    *   Manager: View-only access to some tabs. Cannot save changes.
    *   Seller: No access or very limited access.
*   **Reports Page:**
    *   Owner/Manager: Access to all report types.
    *   Seller: Access only to sales-related reports (if applicable).
*   **Error Messages:** Verify appropriate "Access Denied" or "Permission Denied" messages are displayed when unauthorized actions are attempted.

## 6. Error Handling Testing

### Objective:
Verify that the application gracefully handles errors and provides user-friendly feedback.

### Test Cases:
*   **Network Errors:**
    *   Disconnect internet mid-operation (e.g., form submission, data fetch).
    *   Verify appropriate error message and retry option.
*   **Validation Errors:**
    *   Submit forms with invalid data (e.g., empty required fields, incorrect email format, weak password).
    *   Verify field-specific validation messages and toast notifications.
*   **API Errors (Simulated):**
    *   Attempt actions that would trigger server-side errors (e.g., unique constraint violation for email/SKU, foreign key violation).
    *   Verify user-friendly error toasts and messages.
*   **Authorization Errors:**
    *   Attempt to access a feature without proper permissions (e.g., seller trying to delete a product).
    *   Verify "Access Denied" page or toast notification.
*   **Unhandled JavaScript Errors:**
    *   Introduce a controlled JS error (e.g., `throw new Error('Test Error')`) within a component.
    *   Verify `ErrorBoundary` catches the error and displays the fallback UI with a retry button.
    *   Confirm error is logged to console.
*   **Loading States:**
    *   Verify skeleton loaders are displayed during data fetches.
    *   Verify spinner is shown during form submissions.
*   **Empty States:**
    *   Navigate to pages with no data (e.g., Products page with no products).
    *   Verify `EmptyState` component with icon, title, description, and action button.

## 7. Performance Testing

### Objective:
Assess the application's responsiveness and efficiency.

### Test Cases:
*   **Page Load Times:**
    *   Measure initial load time for dashboard, sales history, products page.
    *   Verify lazy loading for images/components works as expected.
*   **Data Loading:**
    *   Test pages with large datasets (e.g., many sales transactions, products).
    *   Verify pagination loads data incrementally.
    *   Verify search/filter functionality with debouncing is responsive.
*   **UI Responsiveness:**
    *   Interact with forms, buttons, dropdowns.
    *   Verify smooth animations and transitions (Framer Motion).
*   **Memory Usage:**
    *   Monitor browser memory usage during extended use.
    *   Check for potential memory leaks.

## 8. Browser Console Verification

### Objective:
Ensure the application runs cleanly without unexpected errors or warnings in the browser console.

### Test Cases:
*   **No JavaScript Errors:**
    *   Load all pages and interact with all features.
    *   Ensure no red `Uncaught ReferenceError`, `TypeError`, etc., messages appear.
*   **No Unwanted Warnings:**
    *   Verify no yellow `console.warn` messages related to React keys, deprecated features, or unhandled promises.
*   **Network Requests:**
    *   Inspect network tab for successful API calls (status 200/201).
    *   Verify no failed requests (4xx/5xx errors) unless expected and handled.
*   **Performance Metrics:**
    *   Use browser's performance tab to analyze rendering performance and identify bottlenecks.
*   **Accessibility (A11y):**
    *   Use browser's accessibility tools to check for basic accessibility issues (e.g., missing ARIA labels, insufficient contrast).

## 9. Final Verification Checklist

*   [ ] All core functionalities (CRUD operations, reporting, notifications) work as expected.
*   [ ] All pages load without errors.
*   [ ] All buttons and interactive elements respond correctly.
*   [ ] All forms validate input and submit data correctly.
*   [ ] Data displayed is accurate and up-to-date.
*   [ ] Charts and visualizations render correctly.
*   [ ] Data export functionalities work as expected.
*   [ ] Error messages are clear, helpful, and non-intrusive.
*   [ ] Loading states (skeletons, spinners) are implemented correctly.
*   [ ] Empty states are displayed when no data is present.
*   [ ] Dark mode toggle functions globally and persists.
*   [ ] Responsive design adapts to various screen sizes.
*   [ ] Role-based access control is strictly enforced.
*   [ ] No critical errors or warnings in the browser console.
*   [ ] All environment variables are correctly configured and secured.

## 10. Browser Compatibility Testing

### Objective:
Ensure the application functions correctly across different web browsers and devices.

### Test Browsers:
*   Google Chrome (latest stable version)
*   Mozilla Firefox (latest stable version)
*   Apple Safari (latest stable version on macOS/iOS)
*   Microsoft Edge (latest stable version)

### Test Devices:
*   Desktop/Laptop (various screen resolutions)
*   Tablet (iPad, Android tablet)
*   Mobile Phone (iPhone, Android phone)

### Test Cases:
*   Perform critical user flows (signup, login, create sale, view dashboard) on each browser/device.
*   Verify layout, styling, and animations render consistently.
*   Check form inputs and interactive elements.
*   Ensure all data displays correctly.
*   Test responsiveness on all devices.
*   Look for browser-specific rendering issues or JavaScript errors.
