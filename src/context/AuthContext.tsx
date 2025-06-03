import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (sessionData.session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (userError) throw userError;
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.role,
              firstName: userData.first_name,
              lastName: userData.last_name,
              phoneNumber: userData.phone_number,
              profileImage: userData.profile_image,
              createdAt: userData.created_at,
              verified: userData.verified
            });
          }
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
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
            return;
          }

          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError) throw userError;
            
            if (userData) {
              setUser({
                id: userData.id,
                email: userData.email,
                role: userData.role,
                firstName: userData.first_name,
                lastName: userData.last_name,
                phoneNumber: userData.phone_number,
                profileImage: userData.profile_image,
                createdAt: userData.created_at,
                verified: userData.verified
              });
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setLoading(true);
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

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
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
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
          verified: data.verified
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserRole }}>
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
