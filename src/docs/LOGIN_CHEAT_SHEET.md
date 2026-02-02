# Login Cheat Sheet & Invite Codes

Use these credentials to test the Bangali Enterprise application.

## 🔑 Owner Accounts (Pre-seeded)

| Business Type | Email | Password | Role |
|---|---|---|---|
| **Retail** | `retail@demo.com` | `password123` | Owner |
| **Agency** | `agency@demo.com` | `password123` | Owner |
| **Education** | `edu@demo.com` | `password123` | Owner |
| **Service** | `service@demo.com` | `password123` | Owner |
| **Freelancer** | `free@demo.com` | `password123` | Owner |

---

## 🎟️ Active Invite Codes (For New User Registration)

Use these codes at `/join-existing-business` to join an existing business as a staff member.

| Business | Code | Role Assigned | Status |
|---|---|---|---|
| **Retail (Super Mart)** | `RET-8834` | Seller | Active |
| **Agency (Creative Minds)** | `AGY-5521` | Manager | Active |
| **Education (Bangali Academy)** | `EDU-7743` | Teacher | Active |
| **Service (FixIt Pro)** | `SRV-2209` | Staff | Active |
| **Freelancer (Solo Dev)** | `FRL-4456` | Manager | Active |

---

## 📋 Test Scenarios

1.  **Join as Staff**: Go to Join Business, enter `RET-8834`. Create account. Verify you land on Retail Dashboard.
2.  **Owner Management**: Login as `retail@demo.com`. Go to Team Management. Generate a new code. 
3.  **Code Revocation**: As Owner, revoke the new code. Try to join with it. Should fail.