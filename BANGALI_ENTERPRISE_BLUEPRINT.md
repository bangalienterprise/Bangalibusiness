# Bangali Enterprise Application Blueprint

## 1. Executive Summary
Bangali Enterprise is a comprehensive, multi-tenant business management platform designed to support various business types (Retail, Service, Agency, Freelancer) through a single, unified interface. It features role-based access control (RBAC), real-time data synchronization via Supabase, and a modular architecture that adapts the UI based on the user's business type and role.

---

## 2. Technology Stack

### Frontend Core
- **Framework:** React 18.2.0
- **Build Tool:** Vite 4.4.5
- **Routing:** React Router DOM 6.16.0
- **Language:** JavaScript (ES Modules)

### UI & Styling
- **Styling Engine:** Tailwind CSS 3.3.3
- **Component Primitives:** Radix UI (Headless UI)
- **Component Library:** shadcn/ui (custom implementation)
- **Icons:** Lucide React 0.292.0
- **Animations:** Framer Motion 10.16.4
- **Charts:** Recharts 2.8.0

### State & Data Management
- **Backend-as-a-Service:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **HTTP Client:** Axios 1.6.0 (wrapped in custom ApiService)
- **Form Handling:** React Hook Form + Zod (Schema Validation)
- **Data Export:** PapaParse (CSV generation)
- **Date Handling:** date-fns 3.6.0

---

## 3. Project Architecture

### Directory Structure