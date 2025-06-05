import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, CreditCard, Key, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { DashboardCard } from '../../../components/dashboard/DashboardCard';
import { NotificationsList } from '../../../components/dashboard/NotificationsList';
import { useCurrentLease, useDashboardStats } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const TenantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = useDashboardStats(user?.id || '');
  const { data: lease } = useCurrentLease(user?.id || '');

  const quickActions = [
    {
      title: 'Housing Status',
      icon: <Key className="h-5 w-5 text-accent-blue" />,
      description: 'View your current lease and housing details',
      path: '/dashboard/tenant/housing-status'
    },
    {
      title: 'Payments',
      icon: <CreditCard className="h-5 w-5 text-accent-blue" />,
      description: 'Manage rent payments and view history',
      path: '/dashboard/tenant/payments'
    },
    {
      title: 'Find Properties',
      icon: <Building className="h-5 w-5 text-accent-blue" />,
      description: 'Browse available student housing',
      path: '/dashboard/tenant/properties'
    },
    {
      title: 'Roommate Matching',
      icon: <Users className="h-5 w-5 text-accent-blue" />,
      description: 'Find compatible roommates',
      path: '/dashboard/tenant/roommate-matching'
    },
    {
      title: 'Legal Assistant',
      icon: <FileText className="h-5 w-5 text-accent-blue" />,
      description: 'Get legal advice and document reviews',
      path: '/dashboard/tenant/legal-assistant'
    },
    {
      title: 'Submit Complaint',
      icon: <MessageSquare className="h-5 w-5 text-accent-blue" />,
      description: 'Report issues or submit requests',
      path: '/dashboard/tenant/complaints'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="mt-1 text-text-secondary">
          Here's an overview of your housing status
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard
          title="Current Rent"
          value={lease ? formatCurrency(lease.rentAmount) : '₦0'}
          icon={<CreditCard className="h-4 w-4" />}
          description={lease ? 'Due monthly' : 'No active lease'}
        />
        <DashboardCard
          title="Properties Viewed"
          value={stats?.propertiesViewed || 0}
          icon={<Building className="h-4 w-4" />}
        />
        <DashboardCard
          title="Saved Properties"
          value={stats?.savedProperties || 0}
          icon={<Building className="h-4 w-4" />}
        />
        <DashboardCard
          title="Active Applications"
          value={stats?.activeApplications || 0}
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {/* Quick Actions Grid */}
      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group cursor-pointer rounded-lg border border-nav p-4 transition-all duration-200 hover:border-accent-blue hover:bg-nav/50"
                onClick={() => navigate(action.path)}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10 transition-colors group-hover:bg-accent-blue/20">
                  {action.icon}
                </div>
                <h3 className="mb-1 font-medium text-text-primary">{action.title}</h3>
                <p className="text-sm text-text-secondary">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {user && <NotificationsList userId={user.id} />}
    </div>
  );
};

export default TenantDashboardPage;