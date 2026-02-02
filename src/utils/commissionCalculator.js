/**
 * Calculates commission amount based on sale total and percentage.
 * @param {number} amount - The total sale amount
 * @param {number} percentage - The commission percentage (0-100)
 * @returns {number} The calculated commission amount
 */
export const calculateCommission = (amount, percentage) => {
  if (!amount || !percentage) return 0;
  return (parseFloat(amount) * parseFloat(percentage)) / 100;
};

/**
 * Calculates fixed commission if applicable, otherwise percentage based.
 * @param {number} amount - Sale amount
 * @param {object} userCommissionSettings - Object containing type, percentage, fixedAmount
 * @returns {number}
 */
export const calculateUserCommission = (amount, settings) => {
  if (!settings || !settings.is_active) return 0;
  
  if (settings.commission_type === 'fixed') {
    return parseFloat(settings.commission_amount || 0);
  }
  
  return calculateCommission(amount, settings.commission_percentage || 0);
};

/**
 * Calculates total commission from an array of sales.
 * Assumes sales objects have 'commission_amount' field populated.
 * @param {Array} sales - Array of sale objects
 * @returns {number} Total commission
 */
export const calculateTotalCommission = (sales) => {
  if (!sales || !Array.isArray(sales)) return 0;
  return sales.reduce((sum, sale) => sum + (parseFloat(sale.commission_amount) || 0), 0);
};

/**
 * Filters sales by date range and calculates commission.
 */
export const calculateCommissionByDateRange = (sales, startDate, endDate) => {
  if (!sales) return 0;
  
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);

  const filtered = sales.filter(sale => {
    const saleDate = new Date(sale.created_at);
    return saleDate >= start && saleDate <= end;
  });

  return calculateTotalCommission(filtered);
};

export const formatCommission = (amount, currency = '৳') => {
  return `${currency}${parseFloat(amount).toFixed(2)}`;
};

export const getCommissionPercentage = (user) => {
  return user?.commission_percentage || 0;
};

export const getCommissionType = (user) => {
  return user?.commission_type || 'percentage';
};