import { apiClient } from '@/services/apiClient';

export const InviteValidationService = {
  async validateInviteCode(code) {
    if (!code) throw new Error("Invite code is required");

    const { data } = await apiClient.get('/business_invitations', { params: { code } });
    const invite = data && data[0];
    
    if (!invite || invite.used_at) {
      throw new Error('Invalid or expired invitation code.');
    }
    
    return invite;
  },

  async claimInvite(code, userId) {
     const { data } = await apiClient.get('/business_invitations', { params: { code } });
     const invite = data && data[0];
     
     if(invite) {
         await apiClient.put(`/business_invitations/${invite.id}`, { used_at: new Date().toISOString(), used_by: userId });
         // Add user to business mock
         await apiClient.put(`/profiles/${userId}`, { business_id: invite.business_id, role: invite.role });
     }
  }
};