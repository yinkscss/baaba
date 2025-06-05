import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { User, Upload } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useUserProfile } from '../../../hooks/useDashboard';

const TenantSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading, updateProfile } = useUserProfile(user?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await updateProfile.mutateAsync({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        notificationPreferences: profile.notificationPreferences
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  if (!profile) return null;

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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
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
                  value={profile.firstName}
                  onChange={(e) => updateProfile.mutate({ ...profile, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => updateProfile.mutate({ ...profile, lastName: e.target.value })}
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={profile.email}
                disabled
              />

              <Input
                label="Phone Number"
                value={profile.phoneNumber || ''}
                onChange={(e) => updateProfile.mutate({ ...profile, phoneNumber: e.target.value })}
              />

              <Button 
                type="submit" 
                className="w-full"
                isLoading={updateProfile.isLoading}
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-nav">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries({
                  email_notifications: 'Email Notifications',
                  sms_notifications: 'SMS Notifications',
                  push_notifications: 'Push Notifications'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-text-primary">{label}</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={profile.notificationPreferences?.[key] || false}
                        onChange={(e) => updateProfile.mutate({
                          ...profile,
                          notificationPreferences: {
                            ...profile.notificationPreferences,
                            [key]: e.target.checked
                          }
                        })}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-nav after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent-blue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/20"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantSettingsPage;