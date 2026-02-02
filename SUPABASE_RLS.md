
# Row Level Security (RLS) Documentation

## Overview
Row Level Security (RLS) is a PostgreSQL feature that allows you to define rules to restrict which rows users can access in a database table. In Bangali Enterprise, we use RLS to ensure data isolation between different businesses and to enforce role-based access control.

## Multi-Tenancy Strategy
We use a **Discriminator Column** strategy where every table that belongs to a business has a `business_id` column. RLS policies enforce that users can only query rows where the `business_id` matches their assigned business.

## Roles & Permissions

### Global Admin (Super Admin)
- **Role:** `super_admin` or `global_admin`
- **Access:** Full access to all rows in all tables.
- **Implementation:** Uses a `checkIsGlobalAdmin()` function or specific policy logic like `auth.jwt() -> role = 'service_role'`.

### Business Owner
- **Role:** `owner`
- **Access:** Full read/write access to all data within their own `business_id`.
- **Policy Logic:** `business_id = get_my_business_id()` AND `auth.role() = 'owner'`

### Business Member (Manager/Seller)
- **Role:** `manager`, `seller`
- **Access:** Restricted based on specific table policies. 
  - Managers can usually edit products/stock.
  - Sellers can usually only create sales and view products.

## Example Policies

### Products Table
