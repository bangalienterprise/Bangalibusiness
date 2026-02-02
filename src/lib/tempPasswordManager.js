import { addDays, isAfter } from 'date-fns';

const TEMP_PASSWORD_STORAGE_KEY = 'temp_passwords';

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateTempPassword = () => {
  return generateRandomString(12);
};

export const createTempPasswordRecord = (userId, tempPassword, expiryHours = 24) => {
  const records = JSON.parse(localStorage.getItem(TEMP_PASSWORD_STORAGE_KEY) || '{}');
  
  records[userId] = {
    tempPassword, // In a real backend, this would be hashed
    expiry: addDays(new Date(), expiryHours / 24).toISOString(),
    used: false
  };
  
  localStorage.setItem(TEMP_PASSWORD_STORAGE_KEY, JSON.stringify(records));
  return records[userId];
};

export const validateTempPassword = (userId, tempPassword) => {
  const records = JSON.parse(localStorage.getItem(TEMP_PASSWORD_STORAGE_KEY) || '{}');
  const record = records[userId];

  if (!record) return { valid: false, reason: 'not_found' };
  if (record.used) return { valid: false, reason: 'already_used' };
  if (isAfter(new Date(), new Date(record.expiry))) return { valid: false, reason: 'expired' };
  if (record.tempPassword !== tempPassword) return { valid: false, reason: 'invalid_password' };

  return { valid: true };
};

export const markTempPasswordUsed = (userId) => {
  const records = JSON.parse(localStorage.getItem(TEMP_PASSWORD_STORAGE_KEY) || '{}');
  if (records[userId]) {
    records[userId].used = true;
    localStorage.setItem(TEMP_PASSWORD_STORAGE_KEY, JSON.stringify(records));
  }
};

export const getTempPasswordExpiry = (userId) => {
  const records = JSON.parse(localStorage.getItem(TEMP_PASSWORD_STORAGE_KEY) || '{}');
  return records[userId] ? records[userId].expiry : null;
};