import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import PropertyListingsPage from './pages/properties/PropertyListingsPage';
import PropertyDetailPage from './pages/properties/PropertyDetailPage';
import RoommateLandingPage from './pages/roommates/RoommateLandingPage';
import LegalAssistantPage from './pages/legal/LegalAssistantPage';
import SubscriptionPage from './pages/subscription/SubscriptionPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Pages
import TenantDashboardPage from './pages/dashboard/tenant/TenantDashboardPage';
import LandlordDashboardPage from './pages/dashboard/landlord/LandlordDashboardPage';
import AddPropertyPage from './pages/dashboard/landlord/AddPropertyPage';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'tenant' | 'landlord' }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/properties" element={<PropertyListingsPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/roommate-matching" element={<RoommateLandingPage />} />
        <Route path="/legal-assistant" element={<LegalAssistantPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<DashboardLayout />}>
        {/* Tenant routes */}
        <Route 
          path="/dashboard/tenant" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantDashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Landlord routes */}
        <Route 
          path="/dashboard/landlord" 
          element={
            <ProtectedRoute requiredRole="landlord">
              <LandlordDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/landlord/add-property" 
          element={
            <ProtectedRoute requiredRole="landlord">
              <AddPropertyPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;