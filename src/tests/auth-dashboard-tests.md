# Authentication & Dashboard Test Suite

## 1. Login Flow Tests
| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| 1.1 | Valid Login (Owner) | Enter valid owner email/password, click login | Redirects to Owner Dashboard | PASS |
| 1.2 | Valid Login (Manager) | Enter valid manager email/password, click login | Redirects to Manager Dashboard | PASS |
| 1.3 | Valid Login (Seller) | Enter valid seller email/password, click login | Redirects to Seller Dashboard | PASS |
| 1.4 | Invalid Password | Enter valid email, invalid password | Show "Invalid credentials" error | PASS |
| 1.5 | Non-existent User | Enter unknown email | Show "User not found" or generic error | PASS |
| 1.6 | Empty Fields | Leave fields empty, click login | Show validation errors | PASS |

## 2. Registration Flow Tests
| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| 2.1 | Valid Registration | Enter valid new details, proper password | Account created, logged in, redirected | PASS |
| 2.2 | Existing Email | Register with existing email | Show "Email already in use" error | PASS |
| 2.3 | Weak Password | Enter password < 8 chars | Show password strength error | PASS |
| 2.4 | Mismatched Passwords | Enter different passwords | Show mismatch error | PASS |

## 3. Dashboard Access (Role-Based)
| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| 3.1 | Owner Access | Login as Owner | Can see Business Settings, Financials | PASS |
| 3.2 | Manager Restriction | Login as Manager | Cannot see Business Settings | PASS |
| 3.3 | Seller Restriction | Login as Seller | Cannot see Team Management | PASS |
| 3.4 | Cross-Role Protection | Manager tries to access /owner-dashboard | Redirected to /access-denied | PASS |

## 4. Session & Security
| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| 4.1 | Session Persistence | Login, refresh page | Still logged in | PASS |
| 4.2 | Logout | Click Logout | Session cleared, redirect to login | PASS |
| 4.3 | Protected Route | Access /dashboard without login | Redirect to /login | PASS |
| 4.4 | Back Button | Logout, click Browser Back | Redirect to login (no dashboard access) | PASS |

## 5. UI/UX
| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| 5.1 | Loading States | Click Login | Button disabled, spinner shown | PASS |
| 5.2 | Error Messages | Trigger error | Toast/Alert shown in red | PASS |
| 5.3 | Responsive | View on mobile | Layout adjusts, menus accessible | PASS |

## 6. Data Integrity
| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| 6.1 | Profile Creation | Register new user | Profile row created in DB | PASS |
| 6.2 | Data Isolation | Seller views sales | Only sees own sales | PASS |