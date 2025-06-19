import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (sessionData.session) {
          await handleUserSession(sessionData.session);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            return;
          }

          if (session) {
            await handleUserSession(session);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (session: any) => {
    try {
      // First, try to get existing user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      
      if (userData) {
        // User exists, set the user state
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.first_name,
          lastName: userData.last_name,
          phoneNumber: userData.phone_number,
          profileImage: userData.profile_image,
          createdAt: userData.created_at,
          verified: userData.verified,
          defaultLandlordId: userData.default_landlord_id
        });
      } else {
        // User doesn't exist, create profile (likely from OAuth)
        console.log('Creating new user profile for OAuth user');
        
        const userMetadata = session.user.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || userMetadata.given_name || '';
        const lastName = nameParts.slice(1).join(' ') || userMetadata.family_name || '';

        const newUserData = {
          id: session.user.id,
          email: session.user.email || '',
          role: 'pending',
          first_name: firstName,
          last_name: lastName,
          profile_image: userMetadata.avatar_url || userMetadata.picture,
          created_at: new Date().toISOString(),
          verified: false
        };

        const { data: createdUser, error: profileError } = await supabase
          .from('users')
          .insert([newUserData])
          .select()
          .single();
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }

        if (createdUser) {
          setUser({
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
            firstName: createdUser.first_name,
            lastName: createdUser.last_name,
            phoneNumber: createdUser.phone_number,
            profileImage: createdUser.profile_image,
            createdAt: createdUser.created_at,
            verified: createdUser.verified,
            defaultLandlordId: createdUser.default_landlord_id
          });
        }
      }
    } catch (error) {
      console.error('Error handling user session:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('This email is already registered. Please try logging in or use a different email address.');
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          role: 'pending',
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          verified: false
        },
      ]);
      
      if (profileError) throw profileError;
    }
  };

  const signInWithGoogle = async () => {
    // Get the current URL to determine the correct redirect
    const currentUrl = window.location.origin;
    
    // For development, ensure we use the correct port
    let redirectUrl = currentUrl;
    if (currentUrl.includes('localhost')) {
      // Extract the port from the current URL
      const port = window.location.port || '5173';
      redirectUrl = `http://localhost:${port}`;
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/onboarding`
      }
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Failed to sign in with Google. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      // Clear all React Query caches to prevent stale data issues
      queryClient.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    let updateData: any = { role: newRole };

    // Generate default landlord ID for agents
    if (newRole === 'agent') {
      const defaultLandlordId = uuidv4();
      updateData.default_landlord_id = defaultLandlordId;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNumber: data.phone_number,
        profileImage: data.profile_image,
        createdAt: data.created_at,
        verified: data.verified,
        defaultLandlordId: data.default_landlord_id
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, updateUserRole }}>
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