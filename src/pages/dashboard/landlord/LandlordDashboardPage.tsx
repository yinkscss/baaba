import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Users, CreditCard, TrendingUp, Plus, Bell, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { DashboardCard } from '../../../components/dashboard/DashboardCard';
import { NotificationsList } from '../../../components/dashboard/NotificationsList';
import { useDashboardStats } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const LandlordDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(user?.id || '');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-text-secondary">
            Here's what's happening with your properties today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/landlord/settings')}>
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Properties"
          value={stats?.totalProperties || 0}
          icon={<Building className="h-4 w-4" />}
          description={`${stats?.activeApplications || 0} active listings`}
        />

        <DashboardCard
          title="Monthly Income"
          value={formatCurrency(stats?.totalIncome || 0)}
          icon={<CreditCard className="h-4 w-4" />}
          description={`From ${stats?.activeApplications || 0} tenants`}
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
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="border border-nav md:col-span-2">
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
                  timestamp: '2 hours ago'
                },
                {
                  id: '2',
                  type: 'payment',
                  message: 'Rent payment received from John Doe',
                  timestamp: '5 hours ago'
                },
                {
                  id: '3',
                  type: 'maintenance',
                  message: 'Maintenance request: Plumbing issue at Lekki House',
                  timestamp: '1 day ago'
                }
              ].map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border border-nav p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-nav p-2">
                      {activity.type === 'application' ? (
                        <Users size={16} className="text-accent-blue" />
                      ) : activity.type === 'payment' ? (
                        <CreditCard size={16} className="text-accent-green" />
                      ) : (
                        <Bell size={16} className="text-warning-DEFAULT" />
                      )}
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

        {/* Quick Actions */}
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Users size={16} className="mr-2" />
              View Applications ({stats?.activeApplications || 0})
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Building size={16} className="mr-2" />
              Manage Properties
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard size={16} className="mr-2" />
              Payment History
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell size={16} className="mr-2" />
              Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandlordDashboardPage;