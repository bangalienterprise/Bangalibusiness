export const validateStoreName = (name) => {
    if (!name || name.length < 3) return "Store name must be at least 3 characters.";
    if (name.length > 100) return "Store name too long.";
    return null;
};

export const validatePhone = (phone) => {
    if (!phone) return "Phone number is required.";
    // Simple regex for flexibility
    if (!/^[0-9+\-\s()]{6,20}$/.test(phone)) return "Invalid phone format.";
    return null;
};

export const validateAddress = (address) => {
    if (!address) return "Address is required.";
    if (address.length < 5) return "Address is too short.";
    return null;
};

export const validateTaxRate = (rate) => {
    const num = parseFloat(rate);
    if (isNaN(num) || num < 0 || num > 100) return "Tax rate must be between 0 and 100.";
    return null;
};

export const validateDiscountLimit = (limit) => {
    const num = parseFloat(limit);
    if (isNaN(num) || num < 0 || num > 100) return "Discount limit must be between 0 and 100.";
    return null;
};

export const validateInvoicePrefix = (prefix) => {
    if (prefix && !/^[a-zA-Z0-9\-_]+$/.test(prefix)) return "Prefix must be alphanumeric.";
    if (prefix && prefix.length > 10) return "Prefix too long (max 10).";
    return null;
};

export const validateAllSettings = (settings) => {
    const errors = {};
    const gen = settings.general_info;
    const tax = settings.sales_tax;
    const inv = settings.invoice;

    if (gen) {
        const nameErr = validateStoreName(gen.store_name);
        if (nameErr) errors.store_name = nameErr;
        
        const phoneErr = validatePhone(gen.phone);
        if (phoneErr) errors.phone = phoneErr;

        const addrErr = validateAddress(gen.address);
        if (addrErr) errors.address = addrErr;
    }

    if (tax) {
        if (tax.enable_tax) {
            const taxErr = validateTaxRate(tax.tax_rate);
            if (taxErr) errors.tax_rate = taxErr;
        }
        if (tax.enable_discount) {
            const discErr = validateDiscountLimit(tax.discount_limit);
            if (discErr) errors.discount_limit = discErr;
        }
    }

    if (inv) {
        const prefErr = validateInvoicePrefix(inv.invoice_prefix);
        if (prefErr) errors.invoice_prefix = prefErr;
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};