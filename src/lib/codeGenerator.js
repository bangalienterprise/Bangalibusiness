export const generateBusinessCode = (type) => {
  const prefixMap = {
    retail: 'RETAIL',
    agency: 'AGENCY',
    education: 'EDU',
    service: 'SERVICE',
    freelancer: 'FREE',
    other: 'BIZ'
  };

  const prefix = prefixMap[type] || 'BIZ';
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `${prefix}-${randomNum}`;
};

export const validateBusinessCode = (code) => {
  const pattern = /^[A-Z]+-\d{4,6}$/; // e.g., RETAIL-8888
  return pattern.test(code);
};

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  
  // Generate 3 random letters
  let letters = '';
  for (let i = 0; i < 3; i++) {
    letters += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Generate 4 random numbers
  let numbers = '';
  for (let i = 0; i < 4; i++) {
    numbers += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  
  return `${letters}-${numbers}`;
};

export const validateInviteCodeFormat = (code) => {
  if (!code) return false;
  // Case insensitive check for XXX-XXXX format
  const pattern = /^[A-Z]{3}-\d{4}$/i;
  return pattern.test(code);
};

export const formatInviteCode = (code) => {
  if (!code) return '';
  // Ensure uppercase and correct spacing if needed, mainly a pass-through for now
  return code.toUpperCase().trim();
};

export const isCodeExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

export const isCodeRevoked = (status) => {
  return status === 'revoked';
};

export const canUseCode = (codeData) => {
  if (!codeData) return false;
  if (isCodeExpired(codeData.expiresAt)) return false;
  if (isCodeRevoked(codeData.status)) return false;
  if (codeData.maxUses !== null && codeData.maxUses !== undefined) {
    if ((codeData.usedCount || 0) >= codeData.maxUses) return false;
  }
  return true;
};