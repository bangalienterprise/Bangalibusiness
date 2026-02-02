# Bangali Enterprise Web Application

![Bangali Enterprise Logo](src/assets/bangali-enterprise-logo.svg)

**Website URL:** [https://bangalienterprise.com](https://bangalienterprise.com)

## Overview

Bangali Enterprise is a comprehensive, multi-tenant business management platform designed to streamline operations across various industries. Built with modern web technologies, it offers specialized dashboards and tools for Retail, Services, Agencies, Freelancers, Education, Manufacturing, and Wholesale businesses.

## Key Features

*   **Multi-Industry Support:** Dedicated dashboards for Retail, Restaurant, Service, Agency, Education, Freelancer, Wholesale, and Manufacturing.
*   **Role-Based Access Control (RBAC):** Secure access for Global Admins, Business Owners, Managers, Sellers, and standard Users.
*   **Authentication:** Secure login, signup, password reset, and invite-based business joining using Supabase Auth.
*   **Inventory & Stock Management:** Real-time tracking of products, low stock alerts, and damage management.
*   **Sales & POS:** Integrated Point of Sale system with receipt generation and sales history.
*   **Financial Management:** Expense tracking, commission calculations, due collection, and financial reporting.
*   **Team Collaboration:** Manage staff, assign roles, and handle permissions dynamically.
*   **System Settings:** Configurable tax rates, currency, invoice customization, and business branding.

## Technology Stack

*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime)
*   **State Management:** React Context API
*   **Icons:** Lucide React
*   **Build Tool:** Vite

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bangalienterprise/Bangalibusiness.git
    cd Bangalibusiness
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials (see `.env.example`).
    *Note: `.env` files are not committed to the repository for security.*

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  **Build for Production:**
    ```bash
    npm run build
    ```

## Project Structure

*   `src/pages`: Contains all page components organized by feature/industry.
*   `src/components`: Reusable UI components.
*   `src/contexts`: Global state management (Auth, Business, Settings).
*   `src/services`: API interactions and business logic.
*   `src/lib`: Utilities and configuration files.

## License

Copyright © 2026 Bangali Enterprise. All rights reserved.
