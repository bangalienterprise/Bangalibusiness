
import { useBusiness } from '@/contexts/BusinessContext';

export const useCurrentBusiness = () => {
    const { activeBusiness } = useBusiness();
    
    if (!activeBusiness) {
        return {
            businessId: null,
            businessName: null,
            businessType: null
        };
    }
    
    return {
        businessId: activeBusiness.id,
        businessName: activeBusiness.name,
        businessType: activeBusiness.business_type || 'retail'
    };
};
