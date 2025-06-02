import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Search, Users, Bell, Star, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';

const TenantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const notifications = [
    {
      id: '1',
      type: 'property',
      message: 'New property match found in your preferred location',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'roommate',
      message: 'A potential roommate has shown interest in connecting',
      time: '5 hours ago'
    },
    {
      id: '3',
      type: 'legal',
      message: 'Your lease agreement review is complete',
      time: '1 day ago'
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-nav">
            <CardContent className="flex items-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/10">
                <Building className="h-6 w-6 text-accent-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary">Properties Viewed</p>
                <p className="text-2xl font-bold text-text-primary">12</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border border-nav">
            <CardContent className="flex items-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/10">
                <Star className="h-6 w-6 text-accent-green" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary">Saved Properties</p>
                <p className="text-2xl font-bold text-text-primary">5</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border border-nav">
            <CardContent className="flex items-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/10">
                <Users className="h-6 w-6 text-accent-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary">Roommate Matches</p>
                <p className="text-2xl font-bold text-text-primary">3</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border border-nav">
            <CardContent className="flex items-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/10">
                <FileText className="h-6 w-6 text-accent-green" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-text-secondary">Applications</p>
                <p className="text-2xl font-bold text-text-primary">2</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
        <Card className="border border-nav">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <Bell className="h-5 w-5 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex cursor-pointer items-start space-x-3 rounded-lg border border-nav p-3 transition-colors hover:bg-nav/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/10">
                    {notification.type === 'property' && <Building className="h-4 w-4 text-accent-blue" />}
                    {notification.type === 'roommate' && <Users className="h-4 w-4 text-accent-green" />}
                    {notification.type === 'legal' && <FileText className="h-4 w-4 text-accent-blue" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{notification.message}</p>
                    <p className="mt-1 text-xs text-text-secondary">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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