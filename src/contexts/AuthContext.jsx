import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { inviteService } from '@/services/inviteService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { isRLSError } from '@/utils/errorHandler';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes to keep context in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setBusiness(null);
        setLoading(false);
      }
    });

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setProfile(null);
        setBusiness(null);
        setLoading(false);
        return;
      }

      const { user, profile, business, error } = await authService.getCurrentUser();
      
      if (error) {
        console.error("Auth check error:", error);
        if (error.message && (error.message.includes('jwt') || error.message.includes('sub claim'))) {
            await authService.logoutUser();
            return;
        }
        if (user) setUser(user);
      }
      
      if (user) setUser(user);
      if (profile) setProfile(profile);
      if (business) setBusiness(business);
      
    } catch (error) {
      console.error("Auth check failed", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    const result = await authService.loginUser({ email, password });
    if (result.error) {
      setLoading(false);
      throw result.error;
    }
    await checkUser();
    setLoading(false);
    return result;
  };

  const signup = async (email, password, fullName, businessType, businessName, accountType, inviteCode) => {
      setLoading(true);
      const result = await authService.signupUser({ 
          email, password, fullName, businessType, businessName, accountType, inviteCode 
      });
      if (result.error) {
          setLoading(false);
          throw result.error;
      }
      await checkUser(); 
      setLoading(false);
      return result;
  };

  const logout = async () => {
    setLoading(true);
    await authService.logoutUser();
    setUser(null);
    setProfile(null);
    setBusiness(null);
    setLoading(false);
  };

  const updatePassword = async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
  };

  const loginWithDemoCredentials = async (roleId) => {
      const credentials = {
          'admin': { email: 'admin@bangali-enterprise.test', password: 'AdminPassword123!' },
          'owner': { email: 'demo.owner@bangali-enterprise.test', password: 'DemoOwner@2026!' },
          'manager': { email: 'demo.manager@bangali-enterprise.test', password: 'DemoManager@2026!' },
          'seller': { email: 'demo.seller@bangali-enterprise.test', password: 'DemoSeller@2026!' }
      };

      const creds = credentials[roleId];
      if (!creds) throw new Error('Invalid demo role');
      return await login(creds.email, creds.password);
  };

  const validateInviteCode = async (code) => {
      return await inviteService.validateInviteCode(code);
  };

  const joinBusinessWithCode = async (code) => {
      setLoading(true);
      if (!user) throw new Error('User must be logged in to join a business');
      
      const result = await inviteService.acceptInviteCode(code, user.id);
      if (result.error) {
          setLoading(false);
          throw result.error;
      }
      await checkUser();
      setLoading(false);
      return result;
  };

  // Legacy/Alias Support for SupabaseAuthContext compatibility
  const signIn = login;
  const loginUser = login; // Fix for "loginUser is not a function" if accessed via context
  const signUp = async (email, password, options) => {
      // Basic raw signup wrapper for compatibility
      return await supabase.auth.signUp({ email, password, options });
  };
  const signupUser = signup; // Fix for consistency
  const signOut = logout;

  const isGlobalAdmin = () => profile?.role === 'global_admin';
  const isOwner = () => profile?.role === 'owner';
  const isManager = () => profile?.role === 'manager';
  const isSeller = () => profile?.role === 'seller';
  const getCurrentBusiness = () => business;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      business,
      loading,
      login,
      loginUser, // Exported alias
      logout,
      signup,
      signupUser, // Exported alias
      // Legacy aliases
      signIn,
      signOut,
      signUp,
      // Extended features
      updatePassword,
      loginWithDemoCredentials,
      validateInviteCode,
      joinBusinessWithCode,
      isAuthenticated,
      // Helpers
      isGlobalAdmin,
      isOwner,
      isManager,
      isSeller,
      getCurrentBusiness,
      role: profile?.role,
      businessId: business?.id
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}