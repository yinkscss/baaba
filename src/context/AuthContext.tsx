import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'tenant' | 'landlord', firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Fetch additional user data from your profiles table
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, role, first_name, last_name, phone_number, profile_image, created_at')
          .eq('id', data.session.user.id)
          .single();
        
        if (!error && userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            firstName: userData.first_name,
            lastName: userData.last_name,
            phoneNumber: userData.phone_number,
            profileImage: userData.profile_image,
            createdAt: userData.created_at
          });
        }
      }
      setLoading(false);
    };

    getSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Fetch user profile data
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, role, first_name, last_name, phone_number, profile_image, created_at')
            .eq('id', session.user.id)
            .single();
          
          if (!error && userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.role,
              firstName: userData.first_name,
              lastName: userData.last_name,
              phoneNumber: userData.phone_number,
              profileImage: userData.profile_image,
              createdAt: userData.created_at
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    role: 'tenant' | 'landlord',
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        // Create user profile in the users table
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            email,
            role,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString()
          },
        ]);
        
        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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