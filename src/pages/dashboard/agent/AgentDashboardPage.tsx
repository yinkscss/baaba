import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Users, CreditCard, TrendingUp, Plus, Bell, Settings, UserCheck, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { DashboardCard } from '../../../components/dashboard/DashboardCard';
import { NotificationsList } from '../../../components/dashboard/NotificationsList';
import { useDashboardStats } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(user?.id || '');

  const quickActions = [
    {
      title: 'Managed Properties',
      icon: <Building className="h-5 w-5 text-accent-blue" />,
      description: 'View and manage properties under your supervision',
      path: '/dashboard/agent/managed-properties',
      count: stats?.totalProperties || 0
    },
    {
      title: 'Add New Property',
      icon: <Plus className="h-5 w-5 text-accent-blue" />,
      description: 'List a new property for your landlord clients',
      path: '/dashboard/landlord/add-property'
    },
    {
      title: 'Inspection Requests',
      icon: <Bell className="h-5 w-5 text-accent-blue" />,
      description: 'Review and approve property inspection requests',
      path: '/dashboard/agent/inspection-requests'
    },
    {
      title: 'Verification Queue',
      icon: <UserCheck className="h-5 w-5 text-accent-blue" />,
      description: 'Process tenant and landlord verification requests',
      path: '/dashboard/agent/verification'
    },
    {
      title: 'Escrow Management',
      icon: <CreditCard className="h-5 w-5 text-accent-blue" />,
      description: 'Monitor and manage escrow transactions',
      path: '/dashboard/agent/escrow'
    },
    {
      title: 'Messages',
      icon: <MessageSquare className="h-5 w-5 text-accent-blue" />,
      description: 'Communicate with tenants and landlords',
      path: '/dashboard/agent/messages'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-text-secondary">
            Here's an overview of your managed properties and activities.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/agent/settings')}>
            <Settings size={18} className="mr-2" />
            Settings
          </Button>
          <Button onClick={() => navigate('/dashboard/landlord/add-property')}>
            <Plus size={18} className="mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Managed Properties"
          value={stats?.totalProperties || 0}
          icon={<Building className="h-4 w-4" />}
          description={`${stats?.activeApplications || 0} active listings`}
        />

        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalIncome || 0)}
          icon={<CreditCard className="h-4 w-4" />}
          description={`From ${stats?.totalProperties || 0} properties`}
        />

        <DashboardCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            value: 5,
            isPositive: true
          }}
        />

        <DashboardCard
          title="Active Requests"
          value={stats?.activeApplications || 0}
          icon={<Bell className="h-4 w-4" />}
          description="Pending inspections"
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
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10 transition-colors group-hover:bg-accent-blue/20">
                    {action.icon}
                  </div>
                  {action.count !== undefined && (
                    <span className="rounded-full bg-accent-blue px-2 py-1 text-xs font-medium text-background">
                      {action.count}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-medium text-text-primary">{action.title}</h3>
                <p className="text-sm text-text-secondary">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: '1',
                type: 'application',
                message: 'New tenant application for Yaba Apartment',
                timestamp: '2 hours ago',
                icon: Users
              },
              {
                id: '2',
                type: 'payment',
                message: 'Rent payment received for Lekki Property',
                timestamp: '5 hours ago',
                icon: CreditCard
              },
              {
                id: '3',
                type: 'maintenance',
                message: 'Maintenance request: AC repair at Victoria Island',
                timestamp: '1 day ago',
                icon: Bell
              },
              {
                id: '4',
                type: 'verification',
                message: 'New tenant verification request submitted',
                timestamp: '2 days ago',
                icon: UserCheck
              }
            ].map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg border border-nav p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-nav p-2">
                    <activity.icon size={16} className="text-accent-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">{activity.message}</p>
                    <p className="text-xs text-text-muted">{activity.timestamp}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {user && <NotificationsList userId={user.id} />}
    </div>
  );
};

export default AgentDashboardPage;