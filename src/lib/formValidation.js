/**
 * Form Validation Utility
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, error: "Email is required" };
  if (!emailRegex.test(email)) return { isValid: false, error: "Invalid email format" };
  return { isValid: true, error: null };
};

export const getPasswordRequirements = (password) => {
  return [
    { id: 1, text: "At least 8 characters", met: password.length >= 8 },
    { id: 2, text: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { id: 3, text: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { id: 4, text: "At least one number", met: /[0-9]/.test(password) },
    { id: 5, text: "At least one special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
};

export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'bg-slate-700', width: '0%' };
  
  const reqs = getPasswordRequirements(password);
  const metCount = reqs.filter(r => r.met).length;

  // Logic to determine label/color based on count of met requirements
  if (metCount <= 1) return { score: 1, label: 'Weak', color: 'bg-[#ef4444]', width: '20%' }; // red-500
  if (metCount === 2) return { score: 2, label: 'Fair', color: 'bg-[#f97316]', width: '40%' }; // orange-500
  if (metCount === 3) return { score: 3, label: 'Good', color: 'bg-[#eab308]', width: '60%' }; // yellow-500
  if (metCount === 4) return { score: 4, label: 'Strong', color: 'bg-[#22c55e]', width: '80%' }; // green-500
  return { score: 5, label: 'Perfect', color: 'bg-[#22c55e]', width: '100%' }; // green-500
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, error: "Password is required" };
  const reqs = getPasswordRequirements(password);
  const unmet = reqs.filter(r => !r.met);
  
  if (unmet.length > 0) {
    return { isValid: false, error: "Password does not meet all requirements" };
  }

  return { isValid: true, error: null };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return { isValid: false, error: "Passwords do not match" };
  return { isValid: true, error: null };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === "") return { isValid: false, error: `${fieldName} is required` };
  return { isValid: true, error: null };
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return { isValid: false, error: "Phone number is required" };
  if (phone.length < 10) return { isValid: false, error: "Phone number is too short" };
  return { isValid: true, error: null };
};