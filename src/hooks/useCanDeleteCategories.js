
import { useUserRole } from './useUserRole';

export const useCanDeleteCategories = () => {
    const { globalRole } = useUserRole();
    const allowedRoles = ['global_admin', 'owner', 'manager'];
    return allowedRoles.includes(globalRole);
};
