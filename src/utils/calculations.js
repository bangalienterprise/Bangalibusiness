
/**
 * Calculates profit margin percentage
 * @param {number} cost 
 * @param {number} price 
 * @returns {string} Percentage fixed to 2 decimals
 */
export const calculateProfitMargin = (cost, price) => {
    const c = Number(cost) || 0;
    const p = Number(price) || 0;
    
    if (p <= 0) return "0.00";
    return (((p - c) / p) * 100).toFixed(2);
};

/**
 * Calculates total value
 * @param {number} cost 
 * @param {number} stock 
 * @returns {number}
 */
export const calculateTotalValue = (cost, stock) => {
    return (Number(cost) || 0) * (Number(stock) || 0);
};

/**
 * Calculates comprehensive stock valuation
 * @param {Array} products 
 * @returns {Object} {costValue, sellingValue, profit, marginPercent, totalItems}
 */
export const calculateStockValuation = (products) => {
    if (!products || !Array.isArray(products)) {
        return { 
            costValue: 0, 
            sellingValue: 0, 
            profit: 0, 
            marginPercent: 0, 
            totalItems: 0 
        };
    }

    let totalItems = 0;
    let costValue = 0;
    let sellingValue = 0;

    products.forEach(p => {
        const qty = Number(p.stock_qty) || 0;
        const cost = Number(p.buying_price) || 0;
        const price = Number(p.selling_price) || 0;

        totalItems += qty;
        costValue += (qty * cost);
        sellingValue += (qty * price);
    });

    const profit = sellingValue - costValue;
    const marginPercent = sellingValue > 0 ? (profit / sellingValue) * 100 : 0;

    return {
        totalItems,
        costValue,
        sellingValue,
        profit,
        marginPercent
    };
};
