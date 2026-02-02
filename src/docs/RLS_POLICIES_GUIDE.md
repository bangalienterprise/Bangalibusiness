
# Row Level Security (RLS) Policies Guide

This document outlines the security architecture implemented via Postgres Row Level Security (RLS) policies for the Bangali Enterprise application. These policies ensure strict data isolation between businesses and enforce role-based access control (RBAC).

## 1. Helper Functions

The policies rely on three key database functions for logic encapsulation:

### `is_global_admin()`
- **Returns**: `boolean`
- **Logic**: Checks if the current authenticated user (`auth.uid()`) has the role `'global_admin'` in the `public.profiles` table.
- **Usage**: Grants unrestricted access to most tables for platform administrators.

### `get_user_role()`
- **Returns**: `text`
- **Logic**: Returns the `role` string (e.g., 'owner', 'manager', 'seller') for the current user from the `public.profiles` table.
- **Usage**: Used to differentiate permissions within a business (e.g., Sellers can create sales but not delete them).

### `user_has_business_access(lookup_business_id uuid)`
- **Returns**: `boolean`
- **Logic**: Returns `true` if the user satisfies ANY of the following:
  1. Is a global admin.
  2. Is the owner of the business (`businesses.owner_id`).
  3. Is a member of the business (`business_users` table).
  4. Has the business set as their primary business (`profiles.business_id`).
- **Usage**: The primary mechanism for enforcing tenant isolation. All business-scoped tables check this function.

## 2. Table-Specific Policies

### 1. Profiles (`public.profiles`)
- **View**: Users can view their own profile, profiles of colleagues in the same business, or if they are a global admin.
- **Update**: Users can only update their own profile.
- **Insert**: Users can only insert their own profile (usually handled on signup).

### 2. Businesses (`public.businesses`)
- **View**: Users can view the business if they own it, belong to it, or are an admin.
- **Update**: Only the Owner (or Admin) can update business details.
- **Insert**: Publicly allowed (to enable business creation during signup).

### 3. Business Data Tables
*(Products, Categories, Suppliers, Expenses, Damage, Gift Cards, Business Settings)*
- **View**: Allowed if `user_has_business_access(business_id)` is true.
- **Manage (Insert/Update/Delete)**: Restricted to **Owners** and **Managers** (and Admins). Sellers have **Read-Only** access.

### 4. Sales & Customers
- **Customers**:
  - View: All business members.
  - Manage: Owners, Managers, **and Sellers**.
- **Sales Transactions**:
  - View: All business members.
  - Create: Owners, Managers, **and Sellers**.
  - Update/Delete: Restricted to **Owners and Managers**. Sellers cannot modify finalized sales.

### 5. System Tables
- **System Settings**: Public Read (for app config), Admin Write only.
- **Business Types**: Public Read, Admin Write only.
- **Audit Logs**: Admin View all. Owners/Managers view their business logs.

## 3. Policy Syntax

- **USING (condition)**: Determines which rows are visible for SELECT, UPDATE, and DELETE operations.
- **WITH CHECK (condition)**: Determines if a new row (INSERT) or updated row (UPDATE) is valid.

## 4. Troubleshooting & Testing

### Common Issues
1. **Access Denied (403)**:
   - Check if `business_id` is correctly passed in the query.
   - Verify the user's role in the `profiles` table.
   - Ensure the user is linked to the business in `business_users` or `profiles`.

2. **Empty Data Returned**:
   - RLS often silently filters rows. If a query returns 0 rows, it likely means the policy condition failed, not that the table is empty.
   - Check `auth.uid()` context in Supabase.

### Verification Queries
To test RLS, run these SQL commands in the Supabase SQL Editor:

