
import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/apiClient';

export const useReportsData = ({ businessId, dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    
    // Using mock filtered fetch
    const { data: salesData } = await apiClient.get('/sales', { params: { business_id: businessId } });
    
    if (salesData) {
        // Mock filtering by date on client side since local storage API is simple
        // const filtered = salesData.filter(...) 
        setData(salesData);
    }
    setLoading(false);
  }, [businessId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
};
