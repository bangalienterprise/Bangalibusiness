# Bangali Enterprise - Production Deployment Guide

## 1. Database Setup
Since the automated database setup could not be completed directly, please follow these manual steps:

1.  Log in to your Supabase Dashboard.
2.  Select your project: `dwjdkwhnqmjwfevklrat`.
3.  Go to the **SQL Editor**.
4.  Open the `master_setup.sql` file located in this project folder.
5.  Copy the entire content of the file.
6.  Paste it into the Supabase SQL Editor.
7.  Click **Run**.

This will create all necessary tables, policies, and link your admin accounts.

## 2. Web Application Deployment
This project includes an automated deployment script `DEPLOY_TO_SERVER.js`.

### Prerequisites
- Node.js installed.
- `node_modules` installed (already done).
- `dist` folder built (already done).

### MySQL Configuration
If your application uses the Hostinger MySQL database for logging or backend storage, the details are:
- **Host:** 127.0.0.1
- **Database:** u562139744_bangaliapp
- **User:** u562139744_bangaliapp
- **Password:** Bangaliadmin@2025.!?

### How to Deploy
Run the following command in your terminal:
```bash
node DEPLOY_TO_SERVER.js
```

This script will:
1. Connect to your Hostinger VPS at `195.35.39.191`.
2. Clean the `public_html` directory.
3. Upload the optimized production build from the `dist` folder.

## 3. Post-Deployment
Once the script finishes:
- Visit `http://195.35.39.191` to see your live application.
- Login with your admin credentials: `admin@bangalienterprise.com` (Check `master_setup.sql` for initial account details if configured).

## 4. Troubleshooting
- If the site is blank, ensure `master_setup.sql` was run successfully in Supabase.
- If deployment fails, check your internet connection or try running the script again.
