export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateTimestamp = (date = new Date()) => {
  return date.toISOString();
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2
  }).format(amount || 0).replace('BDT', '৳');
};

export const calculateTotals = (items, field = 'amount') => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
};

export const filterByDateRange = (data, startDate, endDate, dateField = 'created_at') => {
  if (!Array.isArray(data)) return [];
  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Infinity;
  
  return data.filter(item => {
    const itemTime = new Date(item[dateField]).getTime();
    return itemTime >= start && itemTime <= end;
  });
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));