
/**
 * Check if the error is RLS related
 */
export const isRLSError = (error) => {
    if (!error || !error.message) return false;
    const msg = error.message.toLowerCase();
    return msg.includes('rls') || msg.includes('policy') || msg.includes('permission denied');
};

/**
 * Check if the error is strictly an access denied error
 */
export const isAccessDeniedError = (error) => {
    if (!error) return false;
    return error.code === '42501' || isRLSError(error); // 42501 is PostgreSQL permission denied
};

/**
 * Handle RLS errors and provide user-friendly messages
 */
export const handleRLSError = (error) => {
    if (isAccessDeniedError(error)) {
        console.error('RLS/Permission Error:', error);
        
        // Try to infer context from message if possible, though mostly generic
        if (error.message.includes('business')) {
            return "You don't have access to this business.";
        }
        if (error.message.includes('admin')) {
            return "Admin access required.";
        }
        
        return "Access denied. You don't have permission to perform this action.";
    }
    return error.message;
};
