
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthSession = () => {
  const { user, loading } = useAuth();
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (user) {
        setSession({ user });
    } else {
        setSession(null);
    }
  }, [user]);

  return { session, loading };
};
