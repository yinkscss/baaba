import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🔍 AuthLayout render:', { 
    loading, 
    hasUser: !!user, 
    userRole: user?.role, 
    pathname: location.pathname 
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('⏳ AuthLayout: Still loading, showing spinner');
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  // If user is authenticated
  if (user) {
    console.log('👤 AuthLayout: User authenticated, checking role and redirect');
    
    // If user role is pending, redirect to onboarding
    if (user.role === 'pending') {
      console.log('➡️ AuthLayout: Redirecting to onboarding (pending role)');
      return <Navigate to="/onboarding" replace />;
    }
    
    // Otherwise, redirect to the appropriate dashboard based on role
    if (user.role === 'tenant') {
      console.log('➡️ AuthLayout: Redirecting to tenant dashboard');
      return <Navigate to="/dashboard/tenant" replace />;
    } else if (user.role === 'agent') {
      console.log('➡️ AuthLayout: Redirecting to agent dashboard');
      return <Navigate to="/dashboard/agent" replace />;
    } else {
      console.log('➡️ AuthLayout: Redirecting to landlord dashboard');
      return <Navigate to="/dashboard/landlord" replace />;
    }
  }

  // If not authenticated, show the auth pages (login/register)
  console.log('🚫 AuthLayout: No user, showing auth pages');
  return <Outlet />;
};

export default AuthLayout;