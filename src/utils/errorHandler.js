
import { toast } from "@/components/ui/use-toast";

/**
 * Check if the error is RLS related (Permission denied or Infinite recursion)
 * @param {Error|Object} error 
 * @returns {boolean}
 */
export const isRLSError = (error) => {
    if (!error) return false;
    const code = error.code || '';
    const msg = (error.message || '').toLowerCase();
    
    // 42501: insufficient_privilege (RLS denied)
    // 42P17: infinite_recursion
    return code === '42501' || code === '42P17' || msg.includes('recursion') || msg.includes('policy') || msg.includes('permission denied');
};

/**
 * Handles Supabase errors and returns a user-friendly message
 * @param {Error|Object} error - The error object from Supabase or generic Error
 * @returns {string} User-friendly error message
 */
export const handleSupabaseError = (error) => {
    console.error("Operation Error:", error);
    
    if (!error) return "An unknown error occurred";

    // Standardize error object
    const msg = error.message || (typeof error === 'string' ? error : "Something went wrong");
    const code = error.code || "";

    if (isRLSError(error)) {
        return "Access denied. You do not have permission to view this data.";
    }

    // Check for specific Supabase/Postgres error codes
    if (code === '23505') {
        return "This record already exists. Please check for duplicates.";
    }
    if (code === '23503') {
        return "Cannot delete this record because it is being used elsewhere.";
    }
    if (code === '42P01') {
        return "System error: Database table not found. Please contact support.";
    }
    if (msg.includes('Failed to fetch')) {
        return "Network error. Please check your internet connection.";
    }
    if (msg.includes('jwt') || msg.includes('sub claim')) {
        return "Session expired. Please log in again.";
    }
    
    return msg;
};

/**
 * Shows an error toast notification
 * @param {string} message - The message to display
 */
export const showErrorToast = (message) => {
    toast({
        variant: "destructive",
        title: "Error",
        description: message,
    });
};

/**
 * Shows a success toast notification
 * @param {string} message - The message to display
 */
export const showSuccessToast = (message) => {
    toast({
        title: "Success",
        description: message,
        className: "bg-green-600 text-white border-none"
    });
};
