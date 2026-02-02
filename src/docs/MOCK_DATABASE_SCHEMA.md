# Mock Database Schema

The `MockDatabaseService` uses a document-oriented structure stored in `localStorage` keys.

## Tables (Collections)

### `users`
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique User ID |
| email | string | Login email |
| password | string | Plaintext (Mock only!) |
| full_name | string | Display name |
| role | string | 'owner', 'manager', 'staff', 'super_admin' |
| business_id | string | Link to `businesses` table |
| business_type | string | Cached type for routing optimization |

### `businesses`
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique Business ID |
| name | string | Business Name |
| type | string | 'retail', 'agency', 'education', etc. |
| owner_email | string | Reference to owner |
| status | string | 'active', 'suspended' |

### `products` (Retail)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Product ID |
| business_id | string | Foreign Key |
| name | string | Product Name |
| price | number | Unit Price |
| stock | number | Quantity on hand |
| category | string | Organization tag |

### `sales` (Retail)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Sale ID |
| business_id | string | Foreign Key |
| items | array | `[{ productId, quantity, price }]` |
| total | number | Grand total |
| date | ISO String | Transaction time |

### `inviteCodes`
| Field | Type | Description |
|-------|------|-------------|
| code | string | 6-char code (e.g. "ABC-123") |
| business_id | string | Target business |
| role | string | Role to assign on join |
| expires_at | ISO String | Expiration time |
| status | string | 'active', 'used' |

## Relationships
-   **One-to-Many:** One Business has many Users (Employees).
-   **One-to-Many:** One Business has many Products/Sales/Projects.
-   **Many-to-One:** Users belong to exactly one Business (in this MVP version).