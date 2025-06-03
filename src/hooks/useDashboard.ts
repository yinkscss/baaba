import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DashboardStats, Notification, Activity } from '../types/dashboard';

export function useDashboardStats(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // If no stats exist yet, create default stats
      if (!data) {
        const defaultStats: Omit<DashboardStats, 'id'> = {
          user_id: userId,
          properties_viewed: 0,
          saved_properties: 0,
          active_applications: 0,
          total_properties: 0,
          total_income: 0,
          occupancy_rate: 0,
          last_updated: new Date().toISOString()
        };

        const { data: newStats, error: insertError } = await supabase
          .from('dashboard_stats')
          .insert(defaultStats)
          .select()
          .single();

        if (insertError) throw insertError;
        return newStats as DashboardStats;
      }

      return data as DashboardStats;
    }
  });

  return query;
}

export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    }
  });

  return {
    ...query,
    markAsRead
  };
}

export function useActivities(userId: string) {
  return useQuery({
    queryKey: ['activities', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Activity[];
    }
  });
}