# Invite Code System

## Overview
The Invite Code system allows Business Owners to securely invite team members to their workspace without manually creating accounts for them. 

## Workflow
1.  **Generation**: Owner generates a unique 7-character code (e.g., `RET-1234`) in the Team Management section.
2.  **Distribution**: Owner shares this code via email, link, or messaging.
3.  **Verification**: New user enters the code on the "Join Team" page. System validates the code against the Mock Database.
4.  **Confirmation**: User sees business details (Name, Owner, Type) to ensure they are joining the right place.
5.  **Registration**: User creates their personal account credentials.
6.  **Access**: User is automatically assigned the role associated with the invite code (e.g., Seller, Manager) and logged into the correct dashboard.

## Security Features
-   **Expiration**: Codes expire automatically after 30 days.
-   **Revocation**: Owners can revoke codes instantly if leaked.
-   **Usage Limits**: System supports max usage limits (currently set to unlimited for MVP).
-   **Role Binding**: Codes are strictly bound to specific roles to prevent unauthorized elevation of privileges.

## Database Schema (`inviteCodes`)
-   `code`: Unique string ID.
-   `business_id`: Link to the parent business.
-   `role`: The role to be assigned (e.g., 'seller').
-   `expiresAt`: Timestamp.
-   `status`: 'active' | 'revoked' | 'expired'.