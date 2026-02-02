import { apiClient } from '@/services/apiClient';

export const BusinessService = {
  createBusiness: async (data) => {
    const businessData = {
      name: data.name,
      owner_id: data.ownerId, 
      business_type_id: data.typeId, 
      status: 'active'
    };
    
    const { success, data: newBusiness, error } = await apiClient.post('/businesses', businessData);

    if (!success) throw new Error(error);

    // Update Profile
    await apiClient.put(`/profiles/${data.ownerId}`, {
        business_id: newBusiness.id,
        role: 'owner'
    });

    return newBusiness;
  },

  updateBusiness: async (id, updates) => {
      const { success, data, error } = await apiClient.put(`/businesses/${id}`, updates);
      if (!success) throw new Error(error);
      return data;
  },

  getBusiness: async (id) => {
      const { success, data, error } = await apiClient.get(`/businesses/${id}`);
      if (!success) throw new Error(error);
      return data;
  }
};