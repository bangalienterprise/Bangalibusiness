
/**
 * NOTE: Converted to JavaScript with JSDoc types as per project constraints enforcing .js files.
 * 
 * @typedef {Object} Product
 * @property {string} id - UUID
 * @property {string} business_id - UUID
 * @property {string} sku - Unique Stock Keeping Unit
 * @property {string} name - Product Name
 * @property {string} [category] - Category Name (Legacy)
 * @property {string} [category_id] - Category UUID
 * @property {string} unit_type - e.g., 'kg', 'pcs'
 * @property {number} buying_price - Cost per unit
 * @property {number} selling_price - Price per unit
 * @property {number} stock_qty - Current stock quantity
 * @property {number} min_stock_alert - Low stock threshold
 * @property {string} [image_url] - Product image
 * @property {string} [description] - Product description
 * @property {string} created_at - ISO Date string
 * @property {string} updated_at - ISO Date string
 */

/**
 * @typedef {Object} Category
 * @property {string} id - UUID
 * @property {string} business_id - UUID
 * @property {string} name - Category Name
 * @property {string} [description] - Optional description
 * @property {number} [product_count] - Count of products (computed)
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {Object} BusinessUser
 * @property {string} id - UUID
 * @property {string} business_id - UUID
 * @property {string} user_id - UUID
 * @property {'owner' | 'manager' | 'seller'} role - User role in business
 * @property {string} joined_at - ISO Date string
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - UUID
 * @property {string} email - User email
 * @property {string} full_name - Display name
 * @property {string} [avatar_url] - Profile picture
 */

export const Types = {};
