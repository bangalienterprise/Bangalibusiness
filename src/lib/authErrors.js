/**
 * Maps Supabase error codes and messages to user-friendly strings.
 * @param {Error|Object} error - The error object from Supabase
 * @returns {string} - A user-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return "An unknown error occurred.";

  const message = (error.message || "").toLowerCase();
  const code = error.code || "";

  // Log for debugging
  console.warn("Auth Error:", { code, message });

  // Map specific messages/codes
  if (message.includes("invalid login credentials") || message.includes("invalid_grant")) {
    return "Invalid email or password. Please try again.";
  }
  if (message.includes("user not found") || code === "user_not_found") {
    return "No account found with this email. Please sign up.";
  }
  if (message.includes("email already in use") || message.includes("user_already_exists") || code === "23505") {
    return "This email is already registered. Please log in.";
  }
  if (message.includes("password should be at least")) {
    return "Password is too weak. It must be at least 6 characters.";
  }
  if (message.includes("rate limit") || code === "429") {
    return "Too many login attempts. Please wait a few minutes and try again.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }
  if (message.includes("network request failed")) {
    return "Network error. Please check your internet connection.";
  }

  // Fallback
  return error.message || "An unexpected error occurred. Please try again.";
};