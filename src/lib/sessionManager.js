// Utility to handle manual session persistence if needed, 
// though Supabase client handles this largely automatically.
// This is used for the "Remember Me" explicit check.

export const setRememberMe = (shouldRemember) => {
  if (shouldRemember) {
    localStorage.setItem('remember_me_preference', 'true');
  } else {
    localStorage.removeItem('remember_me_preference');
  }
};

export const getRememberMe = () => {
  return localStorage.getItem('remember_me_preference') === 'true';
};

export const clearSessionConfig = () => {
  localStorage.removeItem('remember_me_preference');
  // Supabase cleanup is handled by auth.signOut()
};