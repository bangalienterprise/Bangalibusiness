export const calculateCartTotals = (items, discount = 0, settings) => {
    const currency = settings?.sales_tax?.currency_symbol || '৳';
    const taxRate = settings?.sales_tax?.enable_tax ? (parseFloat(settings?.sales_tax?.tax_rate) || 0) : 0;
    const discountLimit = settings?.sales_tax?.discount_limit || 0;
    const enableDiscount = settings?.sales_tax?.enable_discount;

    // 1. Calculate Subtotal
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.selling_price || 0) * item.quantity), 0);

    // 2. Validate & Apply Discount
    let appliedDiscount = 0;
    if (enableDiscount) {
        // Assume discount is passed as flat amount for now, 
        // could be extended to % if UI supports it.
        // If discount is raw value, we need to check if it's > limit% of subtotal?
        // Let's assume input is flat amount.
        
        // Check if discount amount exceeds % limit of subtotal
        const maxDiscountAmount = (subtotal * discountLimit) / 100;
        
        if (discount > maxDiscountAmount) {
             // Return validation error or cap it? Usually we cap or flag.
             // For calculation logic, we'll cap it to be safe, but UI should warn.
             appliedDiscount = maxDiscountAmount; 
        } else {
             appliedDiscount = discount;
        }
    }

    const taxableAmount = Math.max(0, subtotal - appliedDiscount);

    // 3. Calculate Tax
    const tax = taxableAmount * (taxRate / 100);

    // 4. Calculate Total
    const total = taxableAmount + tax;

    return {
        subtotal,
        discount: appliedDiscount,
        tax,
        total,
        currency_symbol: currency,
        tax_rate: taxRate,
        items_count: items.reduce((acc, i) => acc + i.quantity, 0)
    };
};