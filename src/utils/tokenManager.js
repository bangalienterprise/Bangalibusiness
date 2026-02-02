export const TokenManager = {
  setToken(token) {
    if (token) {
      localStorage.setItem('supabase.auth.token', JSON.stringify(token));
      console.log('[TokenManager] Token stored');
    }
  },

  getToken() {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      return token ? JSON.parse(token) : null;
    } catch (e) {
      console.error('[TokenManager] Token parse error:', e);
      return null;
    }
  },

  getAccessToken() {
    const token = this.getToken();
    return token?.access_token || null;
  },

  getRefreshToken() {
    const token = this.getToken();
    return token?.refresh_token || null;
  },

  clearToken() {
    localStorage.removeItem('supabase.auth.token');
    console.log('[TokenManager] Token cleared');
  },

  isTokenExpired(token) {
    if (!token?.expires_at) return true;
    return new Date().getTime() > token.expires_at * 1000;
  }
};

export default TokenManager;