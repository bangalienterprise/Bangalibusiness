# Testing Checklist

## Invite System
- [ ] **Valid Flow**: Enter valid code `RET-8834`. Confirm details. Create account. Verify dashboard access.
- [ ] **Invalid Format**: Enter `12345`. Should show "Invalid format" error.
- [ ] **Non-existent Code**: Enter `ABC-0000`. Should show "Invalid invite code" error.
- [ ] **Expired Code**: (Requires DB manipulation or waiting). Verify expired code rejection.
- [ ] **Revoked Code**: Login as Owner, revoke a code. Try to join with it. Verify rejection.
- [ ] **Duplicate Email**: Try to register with `retail@demo.com` (existing owner). Should show "User already exists".
- [ ] **Password Strength**: Try "weak". Should fail requirements. Try "StrongP@ss1". Should pass.

## Business Isolation
- [ ] **Retail Join**: Joining with `RET-8834` grants access to Retail POS.
- [ ] **Agency Join**: Joining with `AGY-5521` grants access to Projects.
- [ ] **Cross Access**: Retail Staff should NOT see Agency Projects route.

## Owner Management
- [ ] **Generate**: Button creates new code in list.
- [ ] **Copy**: Button copies to clipboard.
- [ ] **Revoke**: Dialog appears, confirming revoke updates status.