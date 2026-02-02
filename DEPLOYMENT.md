
# Deployment Guide

## Prerequisites
1. **Supabase Project**: Active project at supabase.com
2. **Hosting Provider**: Vercel, Netlify, or similar (Frontend only)
3. **Domain Name**: Optional

## Environment Variables
Set these variables in your hosting provider's dashboard:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Public Anon Key |
| `VITE_APP_ENV` | Set to `production` |
| `VITE_APP_URL` | Your production URL |

**WARNING**: Do NOT set `VITE_SUPABASE_SERVICE_KEY` in your production frontend deployment unless you have a specific secure server-side rendering setup. The service key allows full database access. For this template, admin functions requiring the service key are designed to be run locally or in a secure admin environment.

## Database Setup
1. Log in to Supabase Dashboard.
2. Go to **SQL Editor**.
3. Copy contents from the generated SQL migrations (found in `src/database/migrations` if exported, or use the automated setup).
4. Run the SQL to create tables and policies.

## Storage
1. Create a public bucket named `products` for product images.
2. Create a public bucket named `avatars` for user profiles.

## Build & Deploy
