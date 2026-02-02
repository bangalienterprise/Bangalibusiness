
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/lib/customSupabaseClient';
import { isRLSError } from '@/utils/errorHandler';

export const useRLSCheck = () => {
    const { user } = useAuth();
    const { activeBusiness } = useBusiness();
    const [permissions, setPermissions] = useState({
        isGlobalAdmin: false,
        hasBusinessAccess: false,
        canEdit: false,
        canDelete: false,
        loading: true
    });

    useEffect(() => {
        const check = async () => {
            if (!user) {
                setPermissions(p => ({ ...p, loading: false }));
                return;
            }

            const isGlobalAdmin = user.role === 'super_admin'; // Quick check from auth context if available
            let hasBusinessAccess = false;

            if (activeBusiness?.id) {
                // Verify access with DB
                try {
                    const { data, error } = await supabase
                        .from('business_users')
                        .select('role')
                        .eq('business_id', activeBusiness.id)
                        .eq('user_id', user.id)
                        .single();
                    
                    if (!error && data) {
                        hasBusinessAccess = true;
                    }
                } catch (err) {
                    if (isRLSError(err)) {
                        console.warn("RLS check failed for business access");
                        // If we are in mock mode (activeBusiness is mock), we allow access
                        if (activeBusiness.id.toString().startsWith('mock-')) {
                            hasBusinessAccess = true;
                        }
                    }
                }
            }

            setPermissions({
                isGlobalAdmin,
                hasBusinessAccess,
                canEdit: hasBusinessAccess || isGlobalAdmin,
                canDelete: hasBusinessAccess || isGlobalAdmin,
                loading: false
            });
        };

        check();
    }, [user, activeBusiness]);

    return permissions;
};

export const useCanAccessBusiness = (businessId) => {
    const { user } = useAuth();
    const [canAccess, setCanAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            if (!businessId || !user) {
                setLoading(false);
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('business_users')
                    .select('role')
                    .eq('business_id', businessId)
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    if (isRLSError(error)) {
                        // Fallback for mock data
                        if (businessId.toString().startsWith('mock-')) {
                            setCanAccess(true);
                        } else {
                            setCanAccess(false);
                        }
                    } else {
                        // Other errors (like not found) mean no access
                        setCanAccess(false);
                    }
                } else {
                    setCanAccess(!!data);
                }
            } catch (err) {
                setCanAccess(false);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, [businessId, user]);

    return { canAccess, loading };
};

export const useCanEditResource = (businessId) => {
    const { canAccess, loading } = useCanAccessBusiness(businessId);
    return { canEdit: canAccess, loading };
};

export const useCanDeleteResource = (businessId) => {
    const { canAccess, loading } = useCanAccessBusiness(businessId);
    return { canDelete: canAccess, loading };
};
