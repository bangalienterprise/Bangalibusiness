# Troubleshooting Guide

## Common Issues

### 1. Login Fails / "Invalid Credentials"
-   **Cause:** Using real passwords instead of the mock password.
-   **Solution:** Always use `Password123!` for test accounts. If you created a custom account, ensure you remember what you typed.
-   **Reset:** Clear `localStorage` to restore default test accounts.

### 2. "Access Denied" on Dashboard
-   **Cause:** You are logged in as a user type that doesn't match the URL. (e.g., Retail User trying to access Agency Dashboard).
-   **Solution:** Click "Dashboard" in the sidebar to go to your authorized home.

### 3. Menu Items Missing
-   **Cause:** Your role is restricted (e.g., Seller).
-   **Solution:** Login as Owner to see full menu.

### 4. Changes Not Saving
-   **Cause:** Browser storage full or disabled.
-   **Solution:** Check if you are in "Incognito Mode" (data is lost when window closes) or clear some storage space.

### 5. Join Business Code Not Working
-   **Cause:** Code expired or typo.
-   **Solution:** Generate a new code from the Owner account. Codes expire in 24 hours.

## Developer Issues

### 1. White Screen / Crash
-   **Check:** Console logs for `undefined` errors.
-   **Fix:** Ensure `MockDatabase` initialized correctly.

### 2. Supabase Errors
-   **Check:** Ensure no files are importing `@supabase/supabase-js`.
-   **Fix:** Use `mockDatabase` service instead.