
import React, { useState, useCallback, useEffect } from 'react';

/**
 * Enhanced useApi hook
 * @param {Function} apiFunction - The async function to execute
 * @param {Array} dependencies - Dependencies to re-create the execution function
 * @param {Object} options - { immediate: boolean, initialData: any }
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(options.immediate || false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      
      if (result && typeof result === 'object' && 'success' in result) {
          if (result.success) {
            setData(result.data);
            return result.data;
          } else {
            throw new Error(result.error || 'Operation failed');
          }
      }

      // Fallback for direct data return (legacy support if mixed)
      setData(result?.data || result);
      return result?.data || result;
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred';
      console.error('[useApi] Error:', msg);
      setError(msg);
      // Don't re-throw unless needed by caller to handle specifically
      throw err; 
    } finally {
      setLoading(false);
    }
  }, dependencies);

  // Immediate execution if requested
  useEffect(() => {
    if (options.immediate) {
      execute().catch(() => {}); // Catch to prevent unhandled promise rejection in effect
    }
  }, [options.immediate]); // Only trigger on mount/immediate change

  const reset = useCallback(() => {
    setData(options.initialData || null);
    setError(null);
    setLoading(false);
  }, [options.initialData]);

  return { data, loading, error, execute, reset, setData };
};

export default useApi;
