import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { SpotifyLogo } from '../../../components/icons/BrandLogos';
import { RoommatePreferenceForm } from '../../../components/dashboard/RoommatePreferenceForm';
import { useAuth } from '../../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import type { RoommatePreference } from '../../../types';

const TenantRoommateMatchingPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['roommatePreferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roommate_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async (data: Partial<RoommatePreference>) => {
      const { error } = await supabase
        .from('roommate_preferences')
        .upsert({
          user_id: user?.id,
          ...data
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roommatePreferences', user?.id] });
    }
  });

  const handleSubmit = async (data: any) => {
    try {
      await updatePreferences.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Roommate Matching
        </h1>
        <p className="mt-1 text-text-secondary">
          Set your preferences to find compatible roommates
        </p>
      </div>

      <Card className="border border-nav">
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
          <CardDescription>
            Tell us about your lifestyle and preferences to find better matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoommatePreferenceForm
            onSubmit={handleSubmit}
            initialData={preferences}
            isLoading={updatePreferences.isLoading}
          />
        </CardContent>
      </Card>

      {preferences && (
        <Card className="border border-nav">
          <CardHeader>
            <CardTitle>Potential Matches</CardTitle>
            <CardDescription>
              Students with similar preferences and interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-text-secondary">
              <SpotifyLogo className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>
                Connect your Spotify account to see potential matches based on music taste.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantRoommateMatchingPage;