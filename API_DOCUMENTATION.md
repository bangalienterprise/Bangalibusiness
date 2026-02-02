
# API Documentation

## Authentication (`src/contexts/AuthContext.jsx`)

### `login(email, password)`
Signs in a user.
- **Returns**: User session object.
- **Error**: Throws error if invalid credentials.

### `signup(email, password, metadata)`
Registers a new user.
- **Metadata**: `{ full_name: string, role: string }`

## Business Data (`src/contexts/BusinessContext.jsx`)

### `activeBusiness`
Current selected business object.

### `switchBusiness(businessId)`
Switches the active context to another business the user belongs to.

## Database Services

### Admin Setup (`src/services/adminSetupService.js`)
- `ensureGlobalAdminExists()`: Creates root admin.
- `initializeAllAccounts()`: Bootstraps demo environment.

### Supabase Tables
- `businesses`: Stores company info.
- `business_users`: Links users to businesses with roles.
- `sales`: Stores transaction headers.
- `products`: Inventory items.

## Row Level Security (RLS)
All tables enforce RLS:
- **Tenant Isolation**: Users can only see data where `business_id` matches their assigned business.
- **Role restrictions**: Sellers cannot delete data; only Owners/Admins can.
