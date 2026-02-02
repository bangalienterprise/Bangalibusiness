
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { isRLSError } from '@/utils/errorHandler';

const BusinessContext = createContext();

export function BusinessProvider({ children }) {
  const { user, profile, isGlobalAdmin, loading: authLoading, businessId } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [accessibleBusinesses, setAccessibleBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccessibleBusinesses([]);
      setCurrentBusiness(null);
      setLoading(false);
      return;
    }

    loadBusinesses();
  }, [user, profile, authLoading, businessId]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      let businesses = [];

      if (isGlobalAdmin()) {
        const { data, error } = await supabase.from('businesses').select('*');
        if (!error) businesses = data;
      } else if (businessId) {
        // Fetch current user's business
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();
        
        if (error) {
            if (isRLSError(error)) {
                console.warn("RLS blocked business access, attempting fallback or ignoring...");
                // If we have a businessId but can't fetch it, it might be a mock business
                if (businessId.toString().startsWith('mock-')) {
                    // Mock business logic could go here if needed
                }
            } else {
                console.warn("Error loading business:", error);
            }
        } else if (data) {
            businesses = [data];
        }
      }

      setAccessibleBusinesses(businesses);

      // Persist selection logic
      const storedId = localStorage.getItem('active_business_id');
      
      // If user is admin, respect stored selection, otherwise default to their only business
      if (isGlobalAdmin()) {
          const stored = businesses.find(b => b.id === storedId);
          if (stored) {
              setCurrentBusiness(stored);
          } else if (businesses.length > 0) {
              setCurrentBusiness(businesses[0]);
          }
      } else {
          // Force select their own business
          if (businesses.length > 0) {
              setCurrentBusiness(businesses[0]);
              localStorage.setItem('active_business_id', businesses[0].id);
          }
      }
      
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = (busId) => {
    const business = accessibleBusinesses.find(b => b.id === busId);
    if (business) {
      setCurrentBusiness(business);
      localStorage.setItem('active_business_id', busId);
      // Refresh app data - simplistic approach
      window.location.reload(); 
    }
  };

  return (
    <BusinessContext.Provider value={{
      currentBusiness,
      accessibleBusinesses,
      loading,
      selectBusiness,
      // Helper aliases
      business: currentBusiness,
      currentBusinessId: currentBusiness?.id
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
