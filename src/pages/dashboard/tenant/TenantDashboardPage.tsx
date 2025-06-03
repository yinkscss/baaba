import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Search, Users, Bell, Star, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { DashboardCard } from '../../../components/dashboard/DashboardCard';
import { NotificationsList } from '../../../components/dashboard/NotificationsList';
import { useDashboardStats } from '../../../hooks/useDashboard';

const TenantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(user?.id || '');

  // Mock data for dashboard
  const recentProperties = [
    {
      id: '1',
      title: 'Modern Studio Near University of Lagos',
      location: 'Yaba, Lagos',
      price: 250000,
      image: 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Pending'
    },
    {
      id: '2',
      title: '2 Bedroom Apartment Near Covenant University',
      location: 'Ota, Ogun',
      price: 450000,
      image: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Viewed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-1 text-text-secondary">
            Here's what's happening with your housing search
          </p>
        </div>
        <Button onClick={() => navigate('/properties')}>
          <Search size={16} className="mr-2" />
          Find Properties
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard
          title="Properties Viewed"
          value={stats?.propertiesViewed || 0}
          icon={<Building className="h-4 w-4" />}
        />
        <DashboardCard
          title="Saved Properties"
          value={stats?.savedProperties || 0}
          icon={<Star className="h-4 w-4" />}
        />
        <DashboardCard
          title="Active Applications"
          value={stats?.activeApplications || 0}
          icon={<FileText className="h-4 w-4" />}
        />
        <DashboardCard
          title="Roommate Matches"
          value="3"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Recent Activity and Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Properties */}
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex cursor-pointer items-center space-x-4 rounded-lg border border-nav p-3 transition-colors hover:bg-nav/50"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-text-secondary">{property.location}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      ₦{property.price.toLocaleString()}/year
                    </p>
                  </div>
                  <span className="rounded-full bg-nav px-2 py-1 text-xs text-text-secondary">
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {user && <NotificationsList userId={user.id} />}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button variant="outline" className="w-full" onClick={() => navigate('/roommate-matching')}>
          <Users size={16} className="mr-2" />
          Find Roommates
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate('/legal-assistant')}>
          <FileText size={16} className="mr-2" />
          Legal Assistant
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate('/subscription')}>
          <Star size={16} className="mr-2" />
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
};

export default TenantDashboardPage;