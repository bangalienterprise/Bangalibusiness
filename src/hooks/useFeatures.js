
import React from 'react';
import { useBusiness } from '@/contexts/BusinessContext';

/**
 * Hook to check if a specific feature is enabled for the current business.
 * Usage: const { isEnabled } = useFeatures(); if (isEnabled('inventory')) { ... }
 */
export const useFeatures = () => {
    const { features, isFeatureEnabled } = useBusiness();

    return {
        features,
        isEnabled: isFeatureEnabled
    };
};
