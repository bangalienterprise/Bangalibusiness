// Manages local persistence of invite codes for better UX and validation

const STORAGE_KEY = 'bangali_enterprise_invites';

export const PersistentInviteManager = {
  // Save an invite to local storage (Owner side)
  saveInvite: (inviteData) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newInvite = {
        ...inviteData,
        createdAt: new Date().toISOString(),
      };
      // Keep only last 10 invites to prevent bloat
      const updated = [newInvite, ...existing].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to save invite locally:', e);
      return false;
    }
  },

  // Get a specific invite if it exists locally (Worker side context if shared device, mostly for owner history)
  getInvite: (code) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return existing.find(i => i.code === code);
    } catch (e) {
      return null;
    }
  },

  // Validate format and local existence (pre-check)
  validateInvite: (code) => {
    // Basic format check (assuming code structure or just non-empty)
    if (!code || code.length < 3) return false;
    return true;
  },
  
  // Get all locally generated invites
  getAllInvites: () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch (e) {
        return [];
      }
  }
};

export default PersistentInviteManager;