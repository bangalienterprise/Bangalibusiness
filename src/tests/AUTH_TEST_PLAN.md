# Authentication System Test Plan

## 1. Login
- [ ] **Valid Login**: Enter valid credentials, verify redirect to Dashboard.
- [ ] **Invalid Credentials**: Enter wrong password, verify "Invalid login credentials" error toast.
- [ ] **Validation**: Leave fields empty, verify inline errors ("Email is required").
- [ ] **Remember Me**: Check box, login, reload page, verify session persists (checking localStorage tokens).
- [ ] **Dark Mode**: Verify UI colors are consistent with dark theme (bg-gray-950, text-white).

## 2. Sign Up - Create Business
- [ ] **Step 1**: Select "Create a Business", verify visual selection state.
- [ ] **Step 2**: Enter valid personal details. Verify email/password format validation.
- [ ] **Step 3**: Enter business details (Name, Type). 
- [ ] **Submission**: Click "Complete Setup".
- [ ] **Verification**: Check Supabase `businesses` table for new row. Check `profiles` table for `role='owner'`. Verify redirect to Dashboard.

## 3. Sign Up - Join Business
- [ ] **Step 1**: Select "Join Existing Business".
- [ ] **Step 3**: Enter *Invalid* Invite Code. Verify "Invalid or expired" error.
- [ ] **Step 3**: Enter *Valid* Invite Code. Verify success message showing Business Name.
- [ ] **Submission**: Click "Complete Setup".
- [ ] **Verification**: Check `user_businesses` table for link. Check `business_invitations` table `used_at` timestamp.

## 4. Forgot Password
- [ ] **Invalid Email**: Enter malformed email, verify validation error.
- [ ] **Submission**: Enter valid email, click Send. Verify success toast.
- [ ] **Email Receipt**: (If SMTP configured) Verify email received.

## 5. Reset Password
- [ ] **Access**: Access `/reset-password` (simulate click from email).
- [ ] **Validation**: Enter weak password, verify error.
- [ ] **Mismatch**: Enter mismatched passwords, verify error.
- [ ] **Success**: Enter valid new password, submit. Verify success toast + redirect to Login.
- [ ] **Login**: Try logging in with *new* password.

## 6. Access Control
- [ ] **Protected Routes**: Try accessing `/dashboard` while logged out. Verify redirect to `/login`.
- [ ] **Public Routes**: Try accessing `/login` while logged in. Verify redirect to `/dashboard`.

## 7. Responsiveness & Accessibility
- [ ] **Mobile**: Open on < 400px width. Verify no horizontal scroll, buttons tappable.
- [ ] **Keyboard**: Use Tab to navigate form. Use Enter to submit. Use Escape to close dialogs.