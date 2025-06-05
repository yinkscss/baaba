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

// Tenant Dashboard Pages
import TenantDashboardPage from './pages/dashboard/tenant/TenantDashboardPage';
import TenantHousingStatusPage from './pages/dashboard/tenant/TenantHousingStatusPage';
import TenantPaymentCenterPage from './pages/dashboard/tenant/TenantPaymentCenterPage';
import TenantPropertiesPage from './pages/dashboard/tenant/TenantPropertiesPage';
import TenantPropertyDetailPage from './pages/dashboard/tenant/TenantPropertyDetailPage';
import TenantRoommateMatchingPage from './pages/dashboard/tenant/TenantRoommateMatchingPage';
import TenantLegalAssistantPage from './pages/dashboard/tenant/TenantLegalAssistantPage';
import TenantComplaintSystemPage from './pages/dashboard/tenant/TenantComplaintSystemPage';
import TenantSettingsPage from './pages/dashboard/tenant/TenantSettingsPage';

// Landlord Dashboard Pages
import LandlordDashboardPage from './pages/dashboard/landlord/LandlordDashboardPage';
import AgentDashboardPage from './pages/dashboard/agent/AgentDashboardPage';
import AddPropertyPage from './pages/dashboard/landlord/AddPropertyPage';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'tenant' | 'landlord' | 'agent' }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is pending, always redirect to onboarding
  if (user.role === 'pending') {
    return <Navigate to="/onboarding" />;
  }
  
  if (requiredRole) {
    // For landlord/agent roles, allow access to landlord dashboard
    if ((requiredRole === 'landlord' || requiredRole === 'agent') && 
        (user.role === 'landlord' || user.role === 'agent')) {
      return <>{children}</>;
    }
    
    // For other roles, require exact match
    if (user.role !== requiredRole) {
      return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
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

      {/* Onboarding route */}
      <Route 
        path="/onboarding" 
        element={
          user?.role === 'pending' ? (
            <OnboardingPage />
          ) : (
            <Navigate to={user ? '/dashboard' : '/login'} />
          )
        } 
      />

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
        <Route 
          path="/dashboard/tenant/housing-status" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantHousingStatusPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/payments" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantPaymentCenterPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/properties" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantPropertiesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/properties/:id" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantPropertyDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/roommate-matching" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantRoommateMatchingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/legal-assistant" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantLegalAssistantPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/complaints" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantComplaintSystemPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/tenant/settings" 
          element={
            <ProtectedRoute requiredRole="tenant">
              <TenantSettingsPage />
            </ProtectedRoute>
          } 
        />

        {/* Landlord/Agent routes */}
        <Route 
          path="/dashboard/landlord" 
          element={
            <ProtectedRoute requiredRole="landlord">
              <LandlordDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/agent" 
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentDashboardPage />
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