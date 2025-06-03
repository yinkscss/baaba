import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DashboardStats, Notification, Activity } from '../types/dashboard';

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as DashboardStats;
    }
  });
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