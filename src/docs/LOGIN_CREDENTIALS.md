# Test Account Credentials

Use the following accounts to test the different business modules and roles within Bangali Enterprise. All passwords are set to `Password123!` for convenience.

## 🔐 Universal Password
**Password:** `Password123!`

---

## 🛒 Retail Module
Features: POS, Stock Management, Sales History, Product Catalog

| Role | Email | Permissions |
|------|-------|-------------|
| **Owner** | `retailowner@bangali.com` | Full Access (POS, Stock, Reports, Settings, Team) |
| **Seller** | `retailseller@bangali.com` | Limited Access (POS, My Orders) |

---

## 🚀 Agency Module
Features: Project Management, Client Portal, Task Board, Invoicing

| Role | Email | Permissions |
|------|-------|-------------|
| **Owner** | `agencyowner@bangali.com` | Full Access (Projects, Clients, Financials, Team) |
| **Manager** | `agencymanager@bangali.com` | Project & Task Management (No Financials) |

---

## 🎓 Education Module
Features: Student Management, Fee Collection, Attendance, Courses

| Role | Email | Permissions |
|------|-------|-------------|
| **Principal** | `principal@bangali.com` | Full Access (Students, Staff, Fees, Reports) |
| **Teacher** | `teacher@bangali.com` | Academic Access (Attendance, Results, Classes) |

---

## 🔧 Service Module
Features: Appointment Booking, Staff Scheduling, Service Menu

| Role | Email | Permissions |
|------|-------|-------------|
| **Owner** | `serviceowner@bangali.com` | Full Access (Calendar, Staff, Services, Revenue) |
| **Staff** | `servicestaff@bangali.com` | Limited Access (My Schedule, Assigned Bookings) |

---

## 💻 Freelancer Module
Features: Time Tracking, Invoicing, Project Tracking

| Role | Email | Permissions |
|------|-------|-------------|
| **Freelancer** | `freelancer@bangali.com` | Full Access to Personal Dashboard |

---

## 🛡️ Administration
Features: Global Oversight, User Management, System Settings

| Role | Email | Permissions |
|------|-------|-------------|
| **Super Admin** | `admin@bangali.com` | System-wide Access (Global Dashboard, CMS, User Mgmt) |

---

### 📝 Notes
- **Business Isolation:** Users logged in as Retail Owner cannot access Agency dashboards.
- **Data Persistence:** Data created during a session is saved to `localStorage`. To reset, clear your browser data or use the "Reset Demo Data" button in settings (if available).
- **Joining:** You can use the `Join Business` page with a generated code from a Manager/Owner account to create new staff associations.