
import React, { useState, useEffect, useCallback } from 'react';

export const useQuery = (queryFn, dependencies = [], enabled = true) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);

  const memoizedQueryFn = useCallback(queryFn, dependencies);

  const executeQuery = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: queryError } = await memoizedQueryFn();
      if (queryError) {
        throw queryError;
      }
      setData(result);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [memoizedQueryFn, enabled]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  return { data, error, loading, refetch: executeQuery };
};
