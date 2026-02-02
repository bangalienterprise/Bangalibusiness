
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

export const useUserRole = () => {
  const { user, profile } = useAuth();
  const { business } = useBusiness();

  // Determine global role (from profile)
  const globalRole = profile?.role || user?.role || 'viewer';
  
  // Determine business role (often same as global role in simple schemas, 
  // or derived from a join table if user belongs to multiple businesses)
  // For now, assume 1 user = 1 role = 1 business context
  const businessRole = globalRole; 

  const isGlobalAdmin = globalRole === 'global_admin';
  const isOwner = globalRole === 'owner' || isGlobalAdmin;
  const isManager = globalRole === 'manager' || isOwner;
  const isSeller = globalRole === 'seller' || isManager;

  return {
    globalRole,
    businessRole,
    canEdit: isManager, // Managers and above can edit
    canDelete: isOwner, // Only Owners and Admins can delete
    canManageTeam: isOwner,
    canChangeSettings: isOwner,
    isGlobalAdmin,
    isOwner,
    isManager,
    isSeller
  };
};
