
# Authentication Flow

## Overview
Bangali Enterprise uses Supabase Auth for user management. The flow includes Sign Up, Sign In, Session Management, and Password Recovery.

## Flows

### 1. Sign Up
1. **User Input:** Email, Password, Full Name, Business Name (for owners).
2. **Action:** `supabaseAuth.signUp(email, password)`
3. **Trigger:** A database trigger automatically creates a `profiles` entry and a `businesses` entry (if owner) upon successful auth user creation.
4. **Result:** User is logged in and redirected to dashboard.

### 2. Sign In
1. **User Input:** Email, Password.
2. **Action:** `supabaseAuth.signIn(email, password)`
3. **Result:** 
   - Success: Session token stored in local storage, user redirected.
   - Failure: Error message displayed.

### 3. Sign Out
1. **Action:** `supabaseAuth.signOut()`
2. **Result:** Local session cleared, user redirected to Login page.

### 4. Password Reset
1. **User Input:** Email.
2. **Action:** `supabaseAuth.resetPassword(email)`
3. **Result:** Supabase sends an email with a password reset link.
4. **Recovery:** User clicks link -> Redirected to app -> Enters new password -> `supabaseAuth.updatePassword(newPass)`.

## Error Handling
All auth functions return a standard object format: `{ user, session, error }`.
- Check `if (error)` to handle failures.
- Use `handleSupabaseError(error)` utility to display user-friendly messages.

## Session Persistence
Supabase client is configured with `persistSession: true` and `autoRefreshToken: true`. This ensures users stay logged in across page reloads until the token expires or they sign out.
