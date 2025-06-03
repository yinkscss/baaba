import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Users, BriefcaseBusiness, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TextShimmer } from '../components/ui/text-shimmer';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, updateUserRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'pending') {
    navigate(user.role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord');
    return null;
  }

  const handleRoleSelection = async (role: 'tenant' | 'landlord' | 'agent') => {
    try {
      await updateUserRole(user.id, role);
      navigate(role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord');
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <TextShimmer
            as="h1"
            className="mb-4 text-4xl font-bold md:text-5xl"
            duration={3}
          >
            Welcome to BAABA.COM
          </TextShimmer>
          <p className="text-lg text-text-secondary">
            Choose your role to get started with Nigeria's leading student housing platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="h-full border border-nav transition-all duration-300 hover:border-accent-blue">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                  <Users className="h-6 w-6 text-accent-blue" />
                </div>
                <CardTitle className="text-2xl">I'm a Student</CardTitle>
                <CardDescription>
                  Looking for safe and affordable housing near my university
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3 text-text-secondary">
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Find verified student-friendly properties
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Match with compatible roommates
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Get legal protection and support
                  </li>
                </ul>
                <Button
                  onClick={() => handleRoleSelection('tenant')}
                  className="w-full"
                >
                  Continue as Student
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="h-full border border-nav transition-all duration-300 hover:border-accent-blue">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                  <Building className="h-6 w-6 text-accent-blue" />
                </div>
                <CardTitle className="text-2xl">I'm a Landlord</CardTitle>
                <CardDescription>
                  Want to list my properties for student tenants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3 text-text-secondary">
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    List properties to verified students
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Access tenant verification services
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Get legal document templates
                  </li>
                </ul>
                <Button
                  onClick={() => handleRoleSelection('landlord')}
                  className="w-full"
                >
                  Continue as Landlord
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="h-full border border-nav transition-all duration-300 hover:border-accent-blue">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                  <BriefcaseBusiness className="h-6 w-6 text-accent-blue" />
                </div>
                <CardTitle className="text-2xl">I'm an Agent</CardTitle>
                <CardDescription>
                  Manage properties on behalf of landlords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3 text-text-secondary">
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Manage multiple landlord portfolios
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Streamline tenant applications
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4 text-accent-blue" />
                    Access comprehensive analytics
                  </li>
                </ul>
                <Button
                  onClick={() => handleRoleSelection('agent')}
                  className="w-full"
                >
                  Continue as Agent
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;