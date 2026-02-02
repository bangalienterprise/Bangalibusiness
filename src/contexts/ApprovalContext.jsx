import React, { createContext, useState, useContext, useCallback } from 'react';
import * as db from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ApprovalContext = createContext();

export const useApproval = () => useContext(ApprovalContext);

export const ApprovalProvider = ({ children }) => {
  const { user: profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!profile?.business_id) return;
    setLoading(true);
    try {
      // Assuming db.get has been set up to handle custom endpoints like this
      const data = await db.database.get('/deletion-requests', { params: { business_id: profile.business_id } });
      setRequests(data || []);
    } catch (error) {
      toast({ title: 'Error fetching requests', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.business_id, toast]);

  const requestDeletion = useCallback(async (item_id, item_type, item_data, reason) => {
    if (!profile?.id || !profile?.business_id) {
      toast({ title: 'User profile not found', variant: 'destructive' });
      return false;
    }

    try {
      const data = await db.database.create('/deletion-requests', {
        user_id: profile.id,
        business_id: profile.business_id,
        item_id,
        item_type,
        item_data,
        reason,
        status: 'pending'
      });

      setRequests(prev => [data, ...prev]);
      toast({ title: 'Deletion Requested', description: 'Your request has been submitted for approval.' });
      return true;
    } catch (error) {
      toast({ title: 'Error submitting request', description: error.message, variant: 'destructive' });
      return false;
    }
  }, [profile, toast]);


  const value = {
    requests,
    loading,
    fetchRequests,
    requestDeletion,
  };

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
};