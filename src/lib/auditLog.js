import { v4 as uuidv4 } from 'uuid';

const AUDIT_LOG_KEY = 'audit_logs';

export const logUserAction = (userId, businessId, action, details, ipAddress = '127.0.0.1') => {
  const logs = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  
  const newLog = {
    id: uuidv4(),
    user_id: userId,
    business_id: businessId,
    action,
    details, // Object containing relevant details
    timestamp: new Date().toISOString(),
    ip_address: ipAddress,
    user_agent: navigator.userAgent
  };
  
  logs.unshift(newLog); // Add to beginning
  
  // Keep only last 1000 logs for localStorage performance
  if (logs.length > 1000) {
    logs.pop();
  }
  
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
  return newLog;
};

export const getAuditLogs = (filters = {}) => {
  const logs = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  
  return logs.filter(log => {
    if (filters.userId && log.user_id !== filters.userId) return false;
    if (filters.businessId && log.business_id !== filters.businessId) return false;
    if (filters.action && log.action !== filters.action) return false;
    // Add date range filters if needed
    return true;
  });
};