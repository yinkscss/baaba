import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { 
  DashboardStats, Notification, Activity, 
  Lease, Payment, Complaint, User 
} from '../types';

export function useDashboardStats(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select(`
          id,
          user_id:userId,
          properties_viewed:propertiesViewed,
          saved_properties:savedProperties,
          active_applications:activeApplications,
          total_properties:totalProperties,
          total_income:totalIncome,
          occupancy_rate:occupancyRate,
          last_updated:lastUpdated
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // If no stats exist yet, create default stats
      if (!data) {
        const defaultStats = {
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
          .select(`
            id,
            user_id:userId,
            properties_viewed:propertiesViewed,
            saved_properties:savedProperties,
            active_applications:activeApplications,
            total_properties:totalProperties,
            total_income:totalIncome,
            occupancy_rate:occupancyRate,
            last_updated:lastUpdated
          `)
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
        .select(`
          id,
          user_id:userId,
          type,
          message,
          read,
          created_at:createdAt
        `)
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
        .select(`
          id,
          user_id:userId,
          type,
          description,
          metadata,
          created_at:createdAt
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Activity[];
    }
  });
}

export function useCurrentLease(userId: string) {
  return useQuery({
    queryKey: ['currentLease', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          user_id:userId,
          property_id:propertyId,
          start_date:startDate,
          end_date:endDate,
          rent_amount:rentAmount,
          lease_document_url:leaseDocumentUrl,
          landlord_contact_id:landlordContactId,
          created_at:createdAt,
          updated_at:updatedAt,
          property:properties (
            id,
            title,
            description,
            location,
            address,
            images
          ),
          landlordContact:users (
            id,
            first_name:firstName,
            last_name:lastName,
            phone_number:phoneNumber
          )
        `)
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Lease | null;
    }
  });
}

export function usePayments(userId: string) {
  return useQuery({
    queryKey: ['payments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          lease_id:leaseId,
          amount,
          payment_date:paymentDate,
          status,
          transaction_id:transactionId,
          created_at:createdAt
        `)
        .eq('lease:leases.user_id', userId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    }
  });
}

export function useComplaints(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['complaints', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          id,
          user_id:userId,
          property_id:propertyId,
          subject,
          description,
          category,
          status,
          priority,
          resolution_notes:resolutionNotes,
          rating,
          created_at:createdAt,
          updated_at:updatedAt
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    }
  });

  const submitComplaint = useMutation({
    mutationFn: async (complaint: Omit<Complaint, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          ...complaint,
          user_id: userId,
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints', userId] });
    }
  });

  return {
    ...query,
    submitComplaint
  };
}

export function useUserProfile(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name:firstName,
          last_name:lastName,
          role,
          phone_number:phoneNumber,
          profile_image:profileImage,
          created_at:createdAt,
          verified,
          notification_preferences:notificationPreferences
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as User;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone_number: updates.phoneNumber,
          notification_preferences: updates.notificationPreferences
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    }
  });

  return {
    ...query,
    updateProfile
  };
}