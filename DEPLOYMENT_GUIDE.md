# Bangali Enterprise Deployment Guide (Production Ready)

Your application is fully configured for the **Retail Business** module with custom branding, aligned dashboards, and a production-grade database schema.

## 1. Database Reset (CRITICAL)

Before deploying the frontend, you must reset your Supabase database to match the new schema.

1.  Log in to your **Supabase Dashboard**.
2.  Go to **SQL Editor**.
3.  Click **New Query**.
4.  Open the file `master_setup_v2.sql` from your project folder.
5.  Copy all the content and paste it into the Supabase SQL Editor.
6.  Click **RUN**.

> **Result:** This will wipe the old data and create the clean tables (`businesses`, `products`, `sales`, etc.) and seed your 4 user accounts linked to "Abul Khayer Consumers".

## 2. Environment Variables

Ensure your hosting provider (Vercel, Netlify, or Hostinger) has these environment variables set:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Build & Deploy

### Option A: Vercel / Netlify (Recommended)
1.  Connect your GitHub repository.
2.  Import the project.
3.  **Build Command:** `npm run build`
4.  **Output Directory:** `dist`
5.  Add the Environment Variables from Step 2.
6.  Click **Deploy**.

### Option B: Hostinger / cPanel (Traditional Hosting)
1.  Run this command in your local terminal:
    ```bash
    npm run build
    ```
2.  This creates a `dist` folder in your project.
3.  Compress the contents of the `dist` folder into a ZIP file.
4.  Upload the ZIP to your hosting's `public_html` folder.
5.  Extract the ZIP.
6.  Ensure you have a `.htaccess` file for React routing (see below).

#### .htaccess (Only for cPanel/Hostinger)
If deploying to a standard web host, create a `.htaccess` file in `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## 4. Final Verification

Once deployed:
1.  **Login** with `enterprisebangali@gmail.com` (Owner).
2.  **Verify Dashboard**: Check if the "Retail Store" dashboard appears with the 6 Quick Actions (POS, Products, Orders, Expenses, Team, Settings).
3.  **Check Branding**: Go to **Settings > Branding** and upload a logo. Verify it updates in the Sidebar.
4.  **Test POS**: Go to **New Sale (POS)** and try adding a product.

## 5. Mobile App (Android)

To update the Android App with these changes:
1.  Run: `npx cap sync`
2.  Run: `npx cap open android`
3.  Build the signed APK from Android Studio.
