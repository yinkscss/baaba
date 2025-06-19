import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  // If user is authenticated
  if (user) {
    // If user role is pending, redirect to onboarding
    if (user.role === 'pending') {
      return <Navigate to="/onboarding" />;
    }
    
    // Otherwise, redirect to the appropriate dashboard based on role
    if (user.role === 'tenant') {
      return <Navigate to="/dashboard/tenant" />;
    } else if (user.role === 'agent') {
      return <Navigate to="/dashboard/agent" />;
    } else {
      return <Navigate to="/dashboard/landlord" />;
    }
  }

  // If not authenticated, show the auth pages (login/register)
  return <Outlet />;
};

export default AuthLayout;