# Role-Based Access Control (RBAC)

## Roles

### 1. Super Admin
-   **Scope:** Global System.
-   **Permissions:** Can manage all businesses, users, and CMS content. Cannot view private business data (data privacy).
-   **Route Access:** `/admin/*`

### 2. Owner
-   **Scope:** Single Business.
-   **Permissions:** Full CRUD on all business resources. Can invite/remove team members. Can edit business settings.
-   **Route Access:** `/dashboard`, `/settings`, `/team`, and all module routes (e.g., `/retail/*`).

### 3. Manager
-   **Scope:** Single Business.
-   **Permissions:** Operational management.
    -   *Retail:* Manage Stock, Products.
    -   *Agency:* Manage Projects.
    -   *No Access:* Billing, Team Management (Invite/Remove), Business Settings.
-   **Route Access:** Module routes (restricted).

### 4. Seller / Staff / Teacher
-   **Scope:** Single Business (Operational).
-   **Permissions:** Execution only.
    -   *Retail (Seller):* POS only.
    -   *Agency (Staff):* View Tasks.
    -   *Education (Teacher):* Attendance.
-   **Route Access:** Highly restricted subset of module routes.

## Permission Matrix

| Action | Super Admin | Owner | Manager | Staff/Seller |
|--------|-------------|-------|---------|--------------|
| Login | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ (Global) | ✅ | ✅ | ✅ |
| Change Business Settings | ❌ | ✅ | ❌ | ❌ |
| Invite Members | ❌ | ✅ | ❌ | ❌ |
| Remove Members | ❌ | ✅ | ❌ | ❌ |
| Create Product/Project | ❌ | ✅ | ✅ | ❌ |
| View Financial Reports | ❌ | ✅ | ❌ | ❌ |
| Process Sale (POS) | ❌ | ✅ | ✅ | ✅ |
| Ban User | ✅ | ❌ | ❌ | ❌ |