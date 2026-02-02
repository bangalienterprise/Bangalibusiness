# Business Isolation Rules

This document defines the strict isolation boundaries and feature sets for each business type supported by Bangali Enterprise.

## 🛒 Retail Business
**Identifier:** `retail`

### Menu Items
-   **Dashboard:** Sales overview, low stock alerts.
-   **POS:** Point of Sale interface for processing transactions.
-   **Products:** Inventory management (Add/Edit/Delete products).
-   **Stock:** Stock level adjustments and history.
-   **Sales:** Transaction history and receipts.
-   **Customers:** CRM for retail buyers.
-   **Reports:** Sales, Revenue, and Inventory reports.

### Role Capabilities
-   **Owner:** All access.
-   **Manager:** Cannot delete business. Can manage stock and products.
-   **Seller:** POS access only. View own sales history.

---

## 🚀 Agency Business
**Identifier:** `agency`

### Menu Items
-   **Dashboard:** Project status, active tasks.
-   **Projects:** Kanban board, project details.
-   **Clients:** Client contact database.
-   **Team:** Staff allocation.
-   **Invoices:** Billing and payment tracking.
-   **Reports:** Project profitability, time logs.

### Role Capabilities
-   **Owner:** All access.
-   **Manager:** Can create/edit projects and assign tasks. No access to financial settings.
-   **Staff:** Can view assigned tasks/projects and log time.

---

## 🎓 Education Business
**Identifier:** `education`

### Menu Items
-   **Dashboard:** Enrollment stats, today's attendance.
-   **Students:** Student roster and profiles.
-   **Courses:** Class and subject management.
-   **Attendance:** Daily tracking.
-   **Fees:** Payment collection and dues.
-   **Reports:** Academic and financial reports.

### Role Capabilities
-   **Principal (Owner):** All access.
-   **Admin (Manager):** Manage student admissions and fees.
-   **Teacher:** Take attendance, view student lists, enter results. No fee access.

---

## 🔧 Service Business
**Identifier:** `service`

### Menu Items
-   **Dashboard:** Today's appointments.
-   **Calendar:** Booking scheduler.
-   **Appointments:** List view of bookings.
-   **Staff:** Technician/Service provider management.
-   **Services:** Service menu and pricing.
-   **Reports:** Revenue and booking stats.

### Role Capabilities
-   **Owner:** All access.
-   **Manager:** Can manage staff schedules and bookings.
-   **Staff:** View own calendar only.

---

## 💻 Freelancer Business
**Identifier:** `freelancer`

### Menu Items
-   **Dashboard:** Income summary, active jobs.
-   **Time Tracking:** Timer and manual logs.
-   **Invoices:** Create and send invoices.
-   **Projects:** Simple project list.
-   **Clients:** Client address book.

### Role Capabilities
-   **Freelancer (Owner):** Single-user mode with full access.