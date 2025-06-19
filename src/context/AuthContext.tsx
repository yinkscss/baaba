import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
            .maybeSingle();
          
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
              verified: userData.verified,
              defaultLandlordId: userData.default_landlord_id
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
            return;
          }

          if (session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
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
                verified: userData.verified,
                defaultLandlordId: userData.default_landlord_id
              });
            } else if (event === 'SIGNED_IN' && session.user) {
              // Handle Google OAuth user creation
              const userMetadata = session.user.user_metadata;
              const fullName = userMetadata.full_name || userMetadata.name || '';
              const nameParts = fullName.split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';

              const { error: profileError } = await supabase.from('users').insert([
                {
                  id: session.user.id,
                  email: session.user.email || '',
                  role: 'pending',
                  first_name: firstName,
                  last_name: lastName,
                  profile_image: userMetadata.avatar_url || userMetadata.picture,
                  created_at: new Date().toISOString(),
                  verified: false
                },
              ]);
              
              if (profileError) {
                console.error('Error creating user profile:', profileError);
              } else {
                // Fetch the newly created user data
                const { data: newUserData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (newUserData) {
                  setUser({
                    id: newUserData.id,
                    email: newUserData.email,
                    role: newUserData.role,
                    firstName: newUserData.first_name,
                    lastName: newUserData.last_name,
                    phoneNumber: newUserData.phone_number,
                    profileImage: newUserData.profile_image,
                    createdAt: newUserData.created_at,
                    verified: newUserData.verified,
                    defaultLandlordId: newUserData.default_landlord_id
                  });
                }
              }
            }
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`
      }
    });
    
    if (error) {
      throw new Error('Failed to sign in with Google. Please try again.');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
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