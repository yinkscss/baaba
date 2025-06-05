import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { User, Mail, Phone, Shield, Bell, Upload } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';

const TenantSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage your profile and account preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-nav">
                      <User className="h-12 w-12 text-text-secondary" />
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 rounded-full bg-accent-blue p-2 text-background hover:bg-accent-blue/90">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled
              />

              <Input
                label="Phone Number"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              />

              <Button className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6"></div>