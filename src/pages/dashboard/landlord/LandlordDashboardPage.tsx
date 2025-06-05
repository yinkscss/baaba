import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Users, CreditCard, TrendingUp, Plus, Bell, Settings, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { DashboardCard } from '../../../components/dashboard/DashboardCard';
import { NotificationsList } from '../../../components/dashboard/NotificationsList';
import { useDashboardStats, useInspectionRequests, useEscrowTransactions } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../lib/utils';

const LandlordDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = useDashboardStats(user?.id || '');
  const { data: inspectionRequests } = useInspectionRequests();
  const { data: escrowTransactions } = useEscrowTransactions();

  const pendingInspections = inspectionRequests?.filter(req => req.status === 'new') || [];
  const pendingEscrow = escrowTransactions?.filter(tx => tx.status === 'pending_release') || [];

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        <DashboardCard
          title="Pending Requests"
          value={pendingInspections.length}
          icon={<Clock className="h-4 w-4" />}
          description="Inspection requests"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Inspection Requests */}
        <Card className="border border-nav md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Inspection Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inspectionRequests?.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-nav p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-nav p-2">
                      {request.status === 'new' ? (
                        <Clock className="h-5 w-5 text-warning-DEFAULT" />
                      ) : request.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-accent-green" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-DEFAULT" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {request.tenant?.firstName} {request.tenant?.lastName}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {request.property?.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(request.requestedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/dashboard/landlord/inspection-requests')}
                  >
                    View
                  </Button>
                </div>
              ))}
              {(!inspectionRequests || inspectionRequests.length === 0) && (
                <p className="text-center text-text-secondary">No inspection requests</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Escrow Transactions */}
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Pending Escrow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEscrow.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-nav p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-text-primary">
                      {formatCurrency(transaction.amount)}
                    </span>
                    <span className="rounded-full bg-warning-DEFAULT/10 px-2 py-1 text-xs font-medium text-warning-DEFAULT">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Initiated {new Date(transaction.initiatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {(!pendingEscrow || pendingEscrow.length === 0) && (
                <p className="text-center text-text-secondary">No pending escrow transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {user && <NotificationsList userId={user.id} />}
    </div>
  );
};

export default LandlordDashboardPage;