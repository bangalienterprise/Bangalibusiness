// NOTE: In a production environment, password hashing MUST be done on the server.
// This is a simulation for the frontend-only prototype using localStorage.

export const hashPassword = async (password) => {
  // Simple encoding for prototype simulation. 
  // DO NOT USE THIS FOR REAL SECURITY.
  // In production: const salt = await bcrypt.genSalt(10); return await bcrypt.hash(password, salt);
  return `hashed_${btoa(password)}`;
};

export const verifyPassword = async (password, hash) => {
  // Simulation check
  return `hashed_${btoa(password)}` === hash;
};

export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};