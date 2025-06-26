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
  const [sessionCheckAttempts, setSessionCheckAttempts] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    const getSession = async () => {
      try {
        console.log('🔍 Checking session...', { attempt: sessionCheckAttempts + 1 });
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        console.log('📋 Session data:', { 
          hasSession: !!sessionData.session, 
          userId: sessionData.session?.user?.id,
          userEmail: sessionData.session?.user?.email 
        });

        if (sessionData.session && mounted) {
          await handleUserSession(sessionData.session);
        } else if (mounted) {
          console.log('🚫 No active session found');
          setUser(null);
        }
      } catch (error) {
        console.error('💥 Error fetching session:', error);
        
        // Increment session check attempts
        setSessionCheckAttempts(prev => prev + 1);
        
        // If we've had multiple failed attempts, force sign out to prevent infinite loops
        if (sessionCheckAttempts >= 3) {
          console.error('🔄 Too many failed session attempts, forcing sign out');
          await forceSignOut();
          return;
        }
        
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const forceSignOut = async () => {
      try {
        console.log('🚪 Force signing out due to session issues');
        queryClient.clear();
        await supabase.auth.signOut();
        setUser(null);
        setSessionCheckAttempts(0);
        
        // Redirect to login if we're not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error during force sign out:', error);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', { event, userId: session?.user?.id });
        
        // Reset session check attempts on successful auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSessionCheckAttempts(0);
        }
        
        try {
          if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            if (mounted) {
              setUser(null);
              queryClient.clear();
            }
            return;
          }

          if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed successfully');
          }

          if (session && mounted) {
            console.log('👤 Processing user session for event:', event);
            await handleUserSession(session);
          } else if (mounted) {
            console.log('🚫 No session in auth state change');
            setUser(null);
          }
        } catch (error) {
          console.error('💥 Error in auth state change:', error);
          
          // If we get an error during auth state change, increment attempts
          setSessionCheckAttempts(prev => prev + 1);
          
          if (sessionCheckAttempts >= 2) {
            console.error('🔄 Multiple auth state errors, forcing sign out');
            await forceSignOut();
          } else if (mounted) {
            setUser(null);
          }
        }
      }
    );

    // Set up a session health check interval
    const sessionHealthCheck = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Session health check failed:', error);
          setSessionCheckAttempts(prev => prev + 1);
          
          if (sessionCheckAttempts >= 3) {
            console.error('🔄 Session health check failed multiple times, forcing sign out');
            await forceSignOut();
          }
        } else if (session) {
          // Reset attempts on successful health check
          setSessionCheckAttempts(0);
        }
      } catch (error) {
        console.error('💥 Session health check error:', error);
      }
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
      clearInterval(sessionHealthCheck);
      if (sessionCheckTimeout) {
        clearTimeout(sessionCheckTimeout);
      }
    };
  }, [sessionCheckAttempts, queryClient]);

  const handleUserSession = async (session: any) => {
    try {
      console.log('🔍 Handling user session for:', session.user.id);
      console.log('📊 Session details:', {
        userId: session.user.id,
        email: session.user.email,
        userMetadata: session.user.user_metadata,
        appMetadata: session.user.app_metadata
      });
      
      // First, try to get existing user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Error fetching user data:', userError);
        throw userError;
      }
      
      if (userData) {
        console.log('✅ Existing user found:', { id: userData.id, role: userData.role });
        // User exists, set the user state
        const userObj = {
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
        };
        
        console.log('👤 Setting user object:', userObj);
        setUser(userObj);
        
        // Handle post-authentication redirects
        handlePostAuthRedirect(userObj);
      } else {
        // User doesn't exist, create profile (likely from OAuth)
        console.log('🆕 Creating new user profile for OAuth user');
        
        const userMetadata = session.user.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || userMetadata.given_name || '';
        const lastName = nameParts.slice(1).join(' ') || userMetadata.family_name || '';

        console.log('📝 Creating user with metadata:', {
          firstName,
          lastName,
          email: session.user.email,
          profileImage: userMetadata.avatar_url || userMetadata.picture
        });

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
          console.error('❌ Error creating user profile:', profileError);
          throw profileError;
        }

        if (createdUser) {
          console.log('✅ New user created:', { id: createdUser.id, role: createdUser.role });
          const userObj = {
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
          };
          
          console.log('👤 Setting new user object:', userObj);
          setUser(userObj);
          
          // Handle post-authentication redirects
          handlePostAuthRedirect(userObj);
        }
      }
    } catch (error) {
      console.error('💥 Error handling user session:', error);
      throw error;
    }
  };

  const handlePostAuthRedirect = (userObj: User) => {
    // Only handle redirects if we're currently on auth-related pages or homepage
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
    
    console.log('🎯 Post-auth redirect check:', { 
      currentPath, 
      isAuthPage, 
      userRole: userObj.role 
    });

    if (!isAuthPage) {
      console.log('🚫 Not on auth page, skipping redirect');
      return;
    }

    console.log('🎯 Handling post-auth redirect for user:', { role: userObj.role, currentPath });

    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      if (userObj.role === 'pending') {
        console.log('➡️ Redirecting to onboarding');
        window.location.href = '/onboarding';
      } else if (userObj.role === 'tenant') {
        console.log('➡️ Redirecting to tenant dashboard');
        window.location.href = '/dashboard/tenant';
      } else if (userObj.role === 'agent') {
        console.log('➡️ Redirecting to agent dashboard');
        window.location.href = '/dashboard/agent';
      } else {
        console.log('➡️ Redirecting to landlord dashboard');
        window.location.href = '/dashboard/landlord';
      }
    }, 100);
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('❌ Sign in error:', error);
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw error;
    }
    console.log('✅ Sign in successful');
  };

  const signUp = async (
    email: string, 
    password: string,
    firstName: string,
    lastName: string
  ) => {
    console.log('📝 Attempting sign up for:', email);
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('This email is already registered. Please try logging in or use a different email address.');
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
    
    if (data.user) {
      console.log('✅ Sign up successful, creating user profile');
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
      
      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw profileError;
      }
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔍 Initiating Google OAuth');
    
    // Get the current URL to determine the correct redirect
    const currentUrl = window.location.origin;
    
    // Construct the redirect URL explicitly
    const redirectUrl = `${currentUrl}/onboarding`;
    
    console.log('🎯 OAuth redirect URL:', redirectUrl);
    console.log('🌐 Current environment:', {
      origin: window.location.origin,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol
    });
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw new Error('Failed to sign in with Google. Please try again.');
    }
    
    console.log('✅ Google OAuth initiated successfully');
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out user');
      
      // Clear all React Query caches to prevent stale data issues
      queryClient.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      // Clear user state
      setUser(null);
      setSessionCheckAttempts(0);
      
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('💥 Error signing out:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    console.log('🔄 Updating user role:', { userId, newRole });
    
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

    if (error) {
      console.error('❌ Role update error:', error);
      throw error;
    }

    if (data) {
      console.log('✅ Role updated successfully');
      const updatedUser = {
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
      };
      
      setUser(updatedUser);
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