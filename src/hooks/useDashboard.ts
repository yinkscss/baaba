import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { 
  DashboardStats, Notification, Activity, 
  Lease, Payment, Complaint, User,
  InspectionRequest, EscrowTransaction, Property
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
          user_id,
          properties_viewed,
          saved_properties,
          active_applications,
          total_properties,
          total_income,
          occupancy_rate,
          last_updated
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
            user_id,
            properties_viewed,
            saved_properties,
            active_applications,
            total_properties,
            total_income,
            occupancy_rate,
            last_updated
          `)
          .single();

        if (insertError) throw insertError;
        
        // Transform snake_case to camelCase
        return {
          id: newStats.id,
          userId: newStats.user_id,
          propertiesViewed: newStats.properties_viewed,
          savedProperties: newStats.saved_properties,
          activeApplications: newStats.active_applications,
          totalProperties: newStats.total_properties,
          totalIncome: newStats.total_income,
          occupancyRate: newStats.occupancy_rate,
          lastUpdated: newStats.last_updated
        } as DashboardStats;
      }

      // Transform snake_case to camelCase
      return {
        id: data.id,
        userId: data.user_id,
        propertiesViewed: data.properties_viewed,
        savedProperties: data.saved_properties,
        activeApplications: data.active_applications,
        totalProperties: data.total_properties,
        totalIncome: data.total_income,
        occupancyRate: data.occupancy_rate,
        lastUpdated: data.last_updated
      } as DashboardStats;
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
          user_id,
          type,
          message,
          read,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase
      return data.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.created_at
      })) as Notification[];
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
          user_id,
          type,
          description,
          metadata,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase
      return data.map(activity => ({
        id: activity.id,
        userId: activity.user_id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.created_at
      })) as Activity[];
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
          user_id,
          property_id,
          start_date,
          end_date,
          rent_amount,
          lease_document_url,
          landlord_contact_id,
          created_at,
          updated_at,
          properties!property_id (
            id,
            title,
            description,
            location,
            address,
            images
          ),
          users!landlord_contact_id (
            id,
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Transform snake_case to camelCase
      return {
        id: data.id,
        userId: data.user_id,
        propertyId: data.property_id,
        startDate: data.start_date,
        endDate: data.end_date,
        rentAmount: data.rent_amount,
        leaseDocumentUrl: data.lease_document_url,
        landlordContactId: data.landlord_contact_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        property: {
          ...data.properties
        },
        landlordContact: data.users ? {
          id: data.users.id,
          firstName: data.users.first_name,
          lastName: data.users.last_name,
          phoneNumber: data.users.phone_number
        } : null
      } as Lease;
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
          lease_id,
          amount,
          payment_date,
          status,
          transaction_id,
          created_at,
          leases!lease_id (
            user_id
          )
        `)
        .eq('leases.user_id', userId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase
      return data.map(payment => ({
        id: payment.id,
        leaseId: payment.lease_id,
        amount: payment.amount,
        paymentDate: payment.payment_date,
        status: payment.status,
        transactionId: payment.transaction_id,
        createdAt: payment.created_at
      })) as Payment[];
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
          user_id,
          property_id,
          subject,
          description,
          category,
          status,
          priority,
          resolution_notes,
          rating,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform snake_case to camelCase
      return data.map(complaint => ({
        id: complaint.id,
        userId: complaint.user_id,
        propertyId: complaint.property_id,
        subject: complaint.subject,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        resolutionNotes: complaint.resolution_notes,
        rating: complaint.rating,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at
      })) as Complaint[];
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
          first_name,
          last_name,
          role,
          phone_number,
          profile_image,
          created_at,
          verified,
          notification_preferences
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Transform snake_case to camelCase
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        phoneNumber: data.phone_number,
        profileImage: data.profile_image,
        createdAt: data.created_at,
        verified: data.verified,
        notificationPreferences: data.notification_preferences
      } as User;
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

      // Transform snake_case to camelCase
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        phoneNumber: data.phone_number,
        profileImage: data.profile_image,
        createdAt: data.created_at,
        verified: data.verified,
        notificationPreferences: data.notification_preferences
      } as User;
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

export function useInspectionRequests(propertyId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inspectionRequests', propertyId],
    queryFn: async () => {
      let query = supabase
        .from('inspection_requests')
        .select(`
          id,
          property_id,
          tenant_id,
          requested_date,
          message,
          status,
          created_at,
          updated_at,
          properties!property_id (
            id,
            title,
            address
          ),
          users!tenant_id (
            id,
            first_name,
            last_name,
            email,
            phone_number,
            school_id_verified,
            phone_verified
          )
        `);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(request => ({
        id: request.id,
        propertyId: request.property_id,
        tenantId: request.tenant_id,
        requestedDate: request.requested_date,
        message: request.message,
        status: request.status,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        property: request.properties,
        tenant: {
          id: request.users.id,
          firstName: request.users.first_name,
          lastName: request.users.last_name,
          email: request.users.email,
          phoneNumber: request.users.phone_number,
          schoolIdVerified: request.users.school_id_verified,
          phoneVerified: request.users.phone_verified
        }
      })) as InspectionRequest[];
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: InspectionRequest['status'] }) => {
      const { error } = await supabase
        .from('inspection_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionRequests'] });
    }
  });

  return {
    ...query,
    updateStatus
  };
}

export function useEscrowTransactions(leaseId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['escrowTransactions', leaseId],
    queryFn: async () => {
      let query = supabase
        .from('escrow_transactions')
        .select(`
          id,
          lease_id,
          amount,
          status,
          initiated_at,
          released_at,
          created_at,
          updated_at,
          leases!lease_id (
            id,
            user_id,
            property_id,
            rent_amount
          )
        `);

      if (leaseId) {
        query = query.eq('lease_id', leaseId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(transaction => ({
        id: transaction.id,
        leaseId: transaction.lease_id,
        amount: transaction.amount,
        status: transaction.status,
        initiatedAt: transaction.initiated_at,
        releasedAt: transaction.released_at,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        lease: transaction.leases
      })) as EscrowTransaction[];
    }
  });

  const releaseFunds = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({
          status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrowTransactions'] });
    }
  });

  return {
    ...query,
    releaseFunds
  };
}

export function useLandlordProperties(landlordId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['landlordProperties', landlordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(property => ({
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        amenities: property.amenities,
        images: property.images,
        landlordId: property.landlord_id,
        createdAt: property.created_at,
        updatedAt: property.updated_at,
        available: property.available,
        featured: property.featured,
        status: property.status
      })) as Property[];
    }
  });

  const updatePropertyStatus = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: Property['status'] }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
    }
  });

  return {
    ...query,
    updatePropertyStatus
  };
}