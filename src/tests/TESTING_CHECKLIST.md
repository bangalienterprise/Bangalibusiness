
# Multi-Tenant Testing Checklist

## 1. Authentication
- [ ] Login as Super Admin (Access to /admin routes)
- [ ] Login as Owner (Access to /retail routes, full control of own business)
- [ ] Login as Manager (No access to Team/Settings, but can manage inventory)
- [ ] Login as Seller (Limited view: POS, Sales History (own), no buy prices)

## 2. Business Isolation (Critical)
- [ ] **Categories**: Create category in Business A. Verify Business B cannot see it.
- [ ] **Products**: Create product in Business A. Verify Business B cannot see it.
- [ ] **Sales**: Create sale in Business A. Verify Business B sales total doesn't change.
- [ ] **Customers**: Verify customers are isolated per business.

## 3. Role-Based Access Control (RBAC)
- [ ] **Seller View**:
    - Go to Products page. Ensure "Buying Price" column is missing/hidden.
    - Ensure "Delete" buttons are hidden/disabled.
    - Go to Sales page. Ensure "Profit" column is hidden.
- [ ] **Manager View**:
    - Ensure "Team" sidebar link is missing.
    - Ensure "Settings" sidebar link is missing.

## 4. Super Admin Functions
- [ ] Verify "Business Selector" appears in Header.
- [ ] Switch businesses and verify data refreshes to selected business.
- [ ] Verify ability to see all businesses in /admin/businesses.
