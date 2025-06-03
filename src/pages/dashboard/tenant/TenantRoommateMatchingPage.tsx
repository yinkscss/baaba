import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { SpotifyLogo } from '../../../components/icons/BrandLogos';
import Button from '../../../components/ui/Button';

const TenantRoommateMatchingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Find Your Perfect Roommate
        </h1>
        <p className="mt-1 text-text-secondary">
          Connect with compatible roommates based on your lifestyle and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Connect Your Spotify</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-text-secondary">
              Link your Spotify account to find roommates with similar music taste
            </p>
            <Button className="flex items-center">
              <SpotifyLogo className="mr-2 h-4 w-4" />
              Connect Spotify
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-text-secondary">
              Set up your roommate preferences to get better matches
            </p>
            <Button variant="outline">Update Preferences</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Potential Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">
            Complete your profile and preferences to see potential roommate matches
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantRoommateMatchingPage;