import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBusiness } from './BusinessContext';
import { apiClient } from '@/services/apiClient';

const FeatureFlagContext = createContext(null);

export const useFeatures = () => useContext(FeatureFlagContext);

export const FeatureFlagProvider = ({ children }) => {
  const { businessId } = useBusiness();
  const [features, setFeatures] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoading(false);
      // Mock features for now since we removed DB tables
      setFeatures(new Set(['sales', 'products', 'customers', 'inventory']));
    };

    fetchFeatures();
  }, [businessId]);

  const isFeatureEnabled = (key) => features.has(key);

  return (
    <FeatureFlagContext.Provider value={{ isFeatureEnabled, features, loading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};