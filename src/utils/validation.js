
/**
 * Validates product data
 * @param {Object} product 
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateProduct = (product) => {
    const errors = [];
    
    if (!product) return { isValid: false, errors: ["Product data is missing"] };

    if (!product.sku || String(product.sku).trim() === '') errors.push("SKU is required");
    if (!product.name || String(product.name).trim() === '') errors.push("Product Name is required");
    
    const cost = Number(product.buying_price);
    const price = Number(product.selling_price);
    const stock = Number(product.stock_qty);
    const minAlert = Number(product.min_stock_alert);
    
    if (isNaN(cost) || cost < 0) errors.push("Cost Price must be a positive number");
    if (isNaN(price) || price < 0) errors.push("Selling Price must be a positive number");
    // Business rule: Selling price usually > cost, but sometimes liquidation happens. 
    // Keeping it as a warning or hard error depends on requirements. 
    // Prompt says: "price > cost".
    if (!isNaN(cost) && !isNaN(price) && price < cost) errors.push("Selling Price should be greater than Cost Price");
    
    if (isNaN(stock) || stock < 0) errors.push("Stock Quantity must be 0 or greater");
    if (isNaN(minAlert) || minAlert < 0) errors.push("Min Stock Alert must be 0 or greater");
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates category data
 * @param {Object} category 
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateCategory = (category) => {
    const errors = [];
    
    if (!category) return { isValid: false, errors: ["Category data is missing"] };

    if (!category.name || String(category.name).trim().length < 3) {
        errors.push("Category name must be at least 3 characters long");
    }
    if (category.name && String(category.name).length > 50) {
        errors.push("Category name cannot exceed 50 characters");
    }
    if (category.description && String(category.description).length > 200) {
        errors.push("Description cannot exceed 200 characters");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
