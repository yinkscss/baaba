import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { 
  DashboardStats, Notification, Activity, 
  Lease, Payment, Complaint, User,
  InspectionRequest, EscrowTransaction, Property,
  Conversation, Message, ConversationParticipant
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Add Commission type
export interface Commission {
  id: string;
  agentId: string;
  leaseId: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  payoutDate?: string;
  createdAt: string;
  notes?: string;
  lease?: {
    id: string;
    userId: string;
    propertyId: string;
    rentAmount: number;
    property?: {
      id: string;
      title: string;
      address: string;
    };
    tenant?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

// Add VerificationRequest type
interface VerificationRequest {
  id: string;
  userId: string;
  type: 'tenant_id_verification' | 'landlord_contract_verification' | 'agent_license_verification';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    schoolIdVerified?: boolean;
    phoneVerified?: boolean;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Add ManagedLandlord type
interface ManagedLandlord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  verified: boolean;
}

export function useDashboardStats(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      console.log('📊 Fetching dashboard stats for user:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        throw error;
      }

      // If no stats exist yet, create default stats
      if (!data) {
        console.log('🆕 Creating default dashboard stats');
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

        if (insertError) {
          console.error('❌ Error creating dashboard stats:', insertError);
          throw insertError;
        }
        
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
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Dashboard stats query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  return query;
}

export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      console.log('🔔 Fetching notifications for user:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      // Transform snake_case to camelCase
      return data.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.created_at
      })) as Notification[];
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Notifications query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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
      console.log('📈 Fetching activities for user:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching activities:', error);
        throw error;
      }

      // Transform snake_case to camelCase
      return data.map(activity => ({
        id: activity.id,
        userId: activity.user_id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.created_at
      })) as Activity[];
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Activities query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });
}

export function useCurrentLease(userId: string) {
  return useQuery({
    queryKey: ['currentLease', userId],
    queryFn: async () => {
      console.log('🏠 Fetching current lease for user:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching current lease:', error);
        throw error;
      }
      
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
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Current lease query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });
}

export function usePayments(userId: string) {
  return useQuery({
    queryKey: ['payments', userId],
    queryFn: async () => {
      console.log('💳 Fetching payments for user:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching payments:', error);
        throw error;
      }

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
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Payments query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });
}

export function useComplaints(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['complaints', userId],
    queryFn: async () => {
      console.log('📝 Fetching complaints for user:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching complaints:', error);
        throw error;
      }

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
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Complaints query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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
      console.log('👤 Fetching user profile for:', userId);
      
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

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        throw error;
      }

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
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ User profile query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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
      console.log('🔍 Fetching inspection requests for property:', propertyId);
      
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
          rescheduled_by,
          reschedule_notes,
          property_title,
          property_address,
          tenant_name,
          tenant_email,
          tenant_phone,
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
          ),
          rescheduler:users!rescheduled_by (
            id,
            first_name,
            last_name
          )
        `);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching inspection requests:', error);
        throw error;
      }

      return data.map(request => ({
        id: request.id,
        propertyId: request.property_id,
        tenantId: request.tenant_id,
        requestedDate: request.requested_date,
        message: request.message,
        status: request.status,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        rescheduledBy: request.rescheduled_by,
        rescheduleNotes: request.reschedule_notes,
        property: {
          id: request.properties?.id || request.property_id,
          title: request.property_title || request.properties?.title || 'Unknown Property',
          address: request.property_address || request.properties?.address || 'Unknown Address'
        },
        tenant: {
          id: request.users?.id || request.tenant_id,
          firstName: request.users?.first_name || request.tenant_name?.split(' ')[0] || 'Unknown',
          lastName: request.users?.last_name || request.tenant_name?.split(' ').slice(1).join(' ') || '',
          email: request.users?.email || request.tenant_email || 'unknown@email.com',
          phoneNumber: request.users?.phone_number || request.tenant_phone,
          schoolIdVerified: request.users?.school_id_verified || false,
          phoneVerified: request.users?.phone_verified || false
        },
        rescheduler: request.rescheduler ? {
          id: request.rescheduler.id,
          firstName: request.rescheduler.first_name,
          lastName: request.rescheduler.last_name
        } : undefined
      })) as InspectionRequest[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Inspection requests query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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

  const rescheduleRequest = useMutation({
    mutationFn: async ({ 
      requestId, 
      newRequestedDate, 
      newMessage, 
      rescheduledByUserId 
    }: { 
      requestId: string; 
      newRequestedDate: string; 
      newMessage: string; 
      rescheduledByUserId: string; 
    }) => {
      const { error } = await supabase
        .from('inspection_requests')
        .update({
          requested_date: newRequestedDate,
          message: newMessage,
          reschedule_notes: newMessage,
          rescheduled_by: rescheduledByUserId,
          status: 'rescheduled'
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionRequests'] });
    }
  });

  const submitRequest = useMutation({
    mutationFn: async (request: {
      propertyId: string;
      tenantId: string;
      requestedDate: string;
      message: string;
      status: InspectionRequest['status'];
    }) => {
      const { data, error } = await supabase
        .from('inspection_requests')
        .insert({
          property_id: request.propertyId,
          tenant_id: request.tenantId,
          requested_date: request.requestedDate,
          message: request.message,
          status: request.status
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionRequests'] });
    }
  });

  return {
    ...query,
    updateStatus,
    rescheduleRequest,
    submitRequest
  };
}

export function useEscrowTransactions(leaseId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['escrowTransactions', leaseId],
    queryFn: async () => {
      console.log('💰 Fetching escrow transactions for lease:', leaseId);
      
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
          tenant_confirmed_inspection,
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

      if (error) {
        console.error('❌ Error fetching escrow transactions:', error);
        throw error;
      }

      return data.map(transaction => ({
        id: transaction.id,
        leaseId: transaction.lease_id,
        amount: transaction.amount,
        status: transaction.status,
        initiatedAt: transaction.initiated_at,
        releasedAt: transaction.released_at,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
        tenantConfirmedInspection: transaction.tenant_confirmed_inspection,
        lease: transaction.leases
      })) as EscrowTransaction[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Escrow transactions query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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

  const confirmTenantInspection = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({
          tenant_confirmed_inspection: true
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
    releaseFunds,
    confirmTenantInspection
  };
}

export function useLandlordProperties(landlordId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['landlordProperties', landlordId],
    queryFn: async () => {
      console.log('🏢 Fetching landlord properties for:', landlordId);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching landlord properties:', error);
        throw error;
      }

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
    },
    enabled: !!landlordId && landlordId !== '', // Only run query when landlordId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Landlord properties query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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

  const updateProperty = useMutation({
    mutationFn: async ({ propertyId, updates }: { propertyId: string; updates: Partial<Property> }) => {
      // Convert from camelCase to snake_case for Supabase
      const supabaseUpdates: any = {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        location: updates.location,
        address: updates.address,
        bedrooms: updates.bedrooms,
        bathrooms: updates.bathrooms,
        size: updates.size,
        amenities: updates.amenities,
        images: updates.images,
        available: updates.available,
        featured: updates.featured,
        status: updates.status
      };

      // Remove undefined values
      Object.keys(supabaseUpdates).forEach(key => {
        if (supabaseUpdates[key] === undefined) {
          delete supabaseUpdates[key];
        }
      });

      const { data, error } = await supabase
        .from('properties')
        .update(supabaseUpdates)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    }
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      // First, get the property to check if it has images
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('images')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      // Note: In a production app, you might want to also delete the images from storage
      // but we'll skip that for simplicity
      return property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });

  return {
    ...query,
    updatePropertyStatus,
    updateProperty,
    deleteProperty
  };
}

// New hook for fetching properties with filters
export function useProperties(filters?: {
  search?: string;
  priceRange?: [number, number];
  bedrooms?: number;
  location?: string;
}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      console.log('🏠 Fetching properties with filters:', filters);
      
      let query = supabase
        .from('properties')
        .select('*')
        .eq('available', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      if (filters?.priceRange) {
        query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
      }

      if (filters?.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching properties:', error);
        throw error;
      }

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
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Properties query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });
}

// New hook for fetching a single property
export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      console.log('🏠 Fetching property:', propertyId);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('❌ Error fetching property:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        address: data.address,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        size: data.size,
        amenities: data.amenities,
        images: data.images,
        landlordId: data.landlord_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        available: data.available,
        featured: data.featured,
        status: data.status
      } as Property;
    },
    enabled: !!propertyId && propertyId !== '', // Only run query when propertyId is valid
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Property query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });
}

// New hook for agent-managed properties
export function useAgentManagedProperties(agentId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['agentManagedProperties', agentId],
    queryFn: async () => {
      console.log('🏢 Fetching agent managed properties for:', agentId);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent_managed_properties_view!inner(agent_id)
        `)
        .eq('agent_managed_properties_view.agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching agent managed properties:', error);
        throw error;
      }

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
    },
    enabled: !!agentId && agentId !== '', // Only run query when agentId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Agent managed properties query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
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
      queryClient.invalidateQueries({ queryKey: ['agentManagedProperties'] });
    }
  });

  const updateProperty = useMutation({
    mutationFn: async ({ propertyId, updates }: { propertyId: string; updates: Partial<Property> }) => {
      // Convert from camelCase to snake_case for Supabase
      const supabaseUpdates: any = {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        location: updates.location,
        address: updates.address,
        bedrooms: updates.bedrooms,
        bathrooms: updates.bathrooms,
        size: updates.size,
        amenities: updates.amenities,
        images: updates.images,
        available: updates.available,
        featured: updates.featured,
        status: updates.status
      };

      // Remove undefined values
      Object.keys(supabaseUpdates).forEach(key => {
        if (supabaseUpdates[key] === undefined) {
          delete supabaseUpdates[key];
        }
      });

      const { data, error } = await supabase
        .from('properties')
        .update(supabaseUpdates)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentManagedProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    }
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      // First, get the property to check if it has images
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('images')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      // Note: In a production app, you might want to also delete the images from storage
      // but we'll skip that for simplicity
      return property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentManagedProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });

  return {
    ...query,
    updatePropertyStatus,
    updateProperty,
    deleteProperty
  };
}

// New hook for commissions
export function useCommissions(agentId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['commissions', agentId],
    queryFn: async () => {
      console.log('💰 Fetching commissions for agent:', agentId);
      
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          id,
          agent_id,
          lease_id,
          amount,
          status,
          payout_date,
          created_at,
          notes,
          leases!lease_id (
            id,
            user_id,
            property_id,
            rent_amount,
            properties!property_id (
              id,
              title,
              address
            ),
            users!user_id (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching commissions:', error);
        throw error;
      }

      return data.map(commission => ({
        id: commission.id,
        agentId: commission.agent_id,
        leaseId: commission.lease_id,
        amount: commission.amount,
        status: commission.status,
        payoutDate: commission.payout_date,
        createdAt: commission.created_at,
        notes: commission.notes,
        lease: commission.leases ? {
          id: commission.leases.id,
          userId: commission.leases.user_id,
          propertyId: commission.leases.property_id,
          rentAmount: commission.leases.rent_amount,
          property: commission.leases.properties ? {
            id: commission.leases.properties.id,
            title: commission.leases.properties.title,
            address: commission.leases.properties.address
          } : undefined,
          tenant: commission.leases.users ? {
            id: commission.leases.users.id,
            firstName: commission.leases.users.first_name,
            lastName: commission.leases.users.last_name,
            email: commission.leases.users.email
          } : undefined
        } : undefined
      })) as Commission[];
    },
    enabled: !!agentId && agentId !== '', // Only run query when agentId is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Commissions query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  const updateCommissionNotes = useMutation({
    mutationFn: async ({ commissionId, notes }: { commissionId: string; notes: string }) => {
      const { error } = await supabase
        .from('commissions')
        .update({ notes })
        .eq('id', commissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions', agentId] });
    }
  });

  return {
    ...query,
    updateCommissionNotes
  };
}

// New hook for verification requests
export function useVerificationRequests() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['verificationRequests'],
    queryFn: async () => {
      console.log('📋 Fetching verification requests');
      
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          id,
          user_id,
          type,
          document_url,
          status,
          submitted_at,
          reviewed_by,
          reviewed_at,
          notes,
          users!user_id (
            id,
            first_name,
            last_name,
            email,
            phone_number,
            role,
            school_id_verified,
            phone_verified
          ),
          reviewer:users!reviewed_by (
            id,
            first_name,
            last_name
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching verification requests:', error);
        throw error;
      }

      return data.map(request => ({
        id: request.id,
        userId: request.user_id,
        type: request.type,
        documentUrl: request.document_url,
        status: request.status,
        submittedAt: request.submitted_at,
        reviewedBy: request.reviewed_by,
        reviewedAt: request.reviewed_at,
        notes: request.notes,
        user: request.users ? {
          id: request.users.id,
          firstName: request.users.first_name,
          lastName: request.users.last_name,
          email: request.users.email,
          phoneNumber: request.users.phone_number,
          role: request.users.role,
          schoolIdVerified: request.users.school_id_verified,
          phoneVerified: request.users.phone_verified
        } : undefined,
        reviewer: request.reviewer ? {
          id: request.reviewer.id,
          firstName: request.reviewer.first_name,
          lastName: request.reviewer.last_name
        } : undefined
      })) as VerificationRequest[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Verification requests query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  const updateVerificationStatus = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes, 
      reviewedBy 
    }: { 
      requestId: string; 
      status: VerificationRequest['status']; 
      notes?: string;
      reviewedBy: string;
    }) => {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status,
          notes,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, update the user's verification status
      if (status === 'approved') {
        const { data: request } = await supabase
          .from('verification_requests')
          .select('user_id, type')
          .eq('id', requestId)
          .single();

        if (request) {
          const updateData: any = {};
          
          if (request.type === 'tenant_id_verification') {
            updateData.school_id_verified = true;
          } else if (request.type === 'landlord_contract_verification') {
            updateData.verified = true;
          } else if (request.type === 'agent_license_verification') {
            updateData.verified = true;
          }

          if (Object.keys(updateData).length > 0) {
            await supabase
              .from('users')
              .update(updateData)
              .eq('id', request.user_id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
    }
  });

  return {
    ...query,
    updateVerificationStatus
  };
}

// New hook for managed landlords (for agents)
export function useManagedLandlords(agentId: string) {
  return useQuery({
    queryKey: ['managedLandlords', agentId],
    queryFn: async () => {
      console.log('👥 Fetching managed landlords for agent:', agentId);
      
      const { data, error } = await supabase
        .from('agent_landlords')
        .select(`
          landlord_id,
          users!landlord_id (
            id,
            first_name,
            last_name,
            email,
            phone_number,
            verified
          )
        `)
        .eq('agent_id', agentId);

      if (error) {
        console.error('❌ Error fetching managed landlords:', error);
        throw error;
      }

      return data.map(item => ({
        id: item.users.id,
        firstName: item.users.first_name,
        lastName: item.users.last_name,
        email: item.users.email,
        phoneNumber: item.users.phone_number,
        verified: item.users.verified
      })) as ManagedLandlord[];
    },
    enabled: !!agentId && agentId !== '', // Only run query when agentId is valid
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Managed landlords query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });
}

// New hooks for messaging functionality
export function useConversations(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      console.log('💬 Fetching conversations for user:', userId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          conversation_participants!inner (
            user_id,
            joined_at,
            users (
              id,
              first_name,
              last_name,
              email,
              role,
              profile_image
            )
          )
        `)
        .eq('conversation_participants.user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching conversations:', error);
        throw error;
      }

      // Get last message for each conversation
      const conversationsWithMessages = await Promise.all(
        data.map(async (conversation) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender_id,
              read,
              users!sender_id (
                first_name,
                last_name
              )
            `)
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('read', false)
            .neq('sender_id', userId);

          return {
            id: conversation.id,
            createdAt: conversation.created_at,
            updatedAt: conversation.updated_at,
            participants: conversation.conversation_participants.map(p => ({
              conversationId: conversation.id,
              userId: p.user_id,
              joinedAt: p.joined_at,
              user: p.users ? {
                id: p.users.id,
                firstName: p.users.first_name,
                lastName: p.users.last_name,
                email: p.users.email,
                role: p.users.role,
                profileImage: p.users.profile_image
              } : undefined
            })),
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.created_at,
              senderId: lastMessage.sender_id,
              read: lastMessage.read,
              sender: lastMessage.users ? {
                firstName: lastMessage.users.first_name,
                lastName: lastMessage.users.last_name
              } : undefined
            } : undefined,
            unreadCount: unreadCount || 0
          } as Conversation;
        })
      );

      return conversationsWithMessages;
    },
    enabled: !!userId && userId !== '', // Only run query when userId is valid
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.warn(`⚠️ Conversations query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  const createConversation = useMutation({
    mutationFn: async (participantIds: string[]) => {
      // Create conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add participants
      const participants = participantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    }
  });

  return {
    ...query,
    createConversation
  };
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      console.log('💬 Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          read,
          users!sender_id (
            id,
            first_name,
            last_name,
            profile_image
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }

      return data.map(message => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        createdAt: message.created_at,
        read: message.read,
        sender: message.users ? {
          id: message.users.id,
          firstName: message.users.first_name,
          lastName: message.users.last_name,
          profileImage: message.users.profile_image
        } : undefined
      })) as Message[];
    },
    enabled: !!conversationId && conversationId !== '', // Only run query when conversationId is valid
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      console.warn(`⚠️ Messages query failed (attempt ${failureCount + 1}):`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, senderId }: { content: string; senderId: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidate # Chia-Network/chia-blockchain
# chia/wallet/wallet_node.py
from __future__ import annotations

import asyncio
import dataclasses
import json
import logging
import multiprocessing
import multiprocessing.context
import random
import sys
import time
import traceback
from pathlib import Path
from typing import Any, ClassVar, Dict, List, Optional, Set, Tuple, Union, cast

import aiohttp
from blspy import AugSchemeMPL, G1Element, G2Element, PrivateKey

from chia.consensus.block_record import BlockRecord
from chia.consensus.blockchain import AddBlockResult
from chia.consensus.constants import ConsensusConstants
from chia.daemon.keychain_proxy import KeychainProxy, connect_to_keychain_and_validate, wrap_local_keychain
from chia.full_node.full_node_api import FullNodeAPI
from chia.protocols import wallet_protocol
from chia.protocols.full_node_protocol import RequestProofOfWeight, RespondProofOfWeight
from chia.protocols.protocol_message_types import ProtocolMessageTypes
from chia.protocols.wallet_protocol import (
    CoinState,
    RequestBlockHeader,
    RequestChildren,
    RespondBlockHeader,
    RespondChildren,
    RespondToCoinUpdates,
    RespondToPhUpdates,
)
from chia.rpc.rpc_server import StateChangedProtocol, default_get_connections
from chia.server.node_discovery import WalletPeers
from chia.server.outbound_message import Message, NodeType, make_msg
from chia.server.peer_store_resolver import PeerStoreResolver
from chia.server.server import ChiaServer
from chia.server.ws_connection import WSChiaConnection
from chia.types.blockchain_format.coin import Coin
from chia.types.blockchain_format.sized_bytes import bytes32
from chia.types.header_block import HeaderBlock
from chia.types.mempool_inclusion_status import MempoolInclusionStatus
from chia.types.peer_info import PeerInfo
from chia.types.spend_bundle import SpendBundle
from chia.util.chunks import chunks
from chia.util.config import lock_and_load_config, process_config_start_method, save_config
from chia.util.db_wrapper import manage_connection
from chia.util.errors import KeychainIsEmpty, KeychainIsLocked, KeychainKeyNotFound, KeychainProxyConnectionFailure
from chia.util.hash import std_hash
from chia.util.ints import uint16, uint32, uint64, uint128
from chia.util.keychain import Keychain
from chia.util.path import path_from_root
from chia.util.profiler import mem_profile_task, profile_task
from chia.wallet.puzzles.clawback.metadata import AutoClaimSettings
from chia.wallet.transaction_record import TransactionRecord
from chia.wallet.util.new_peak_queue import NewPeakItem, NewPeakQueue, NewPeakQueueTypes
from chia.wallet.util.peer_request_cache import PeerRequestCache, can_use_peer_request_cache
from chia.wallet.util.wallet_sync_utils import (
    PeerRequestException,
    fetch_header_blocks_in_range,
    fetch_last_tx_from_peer,
    request_and_validate_additions,
    request_and_validate_removals,
    subscribe_to_coin_updates,
    subscribe_to_phs,
)
from chia.wallet.util.wallet_types import CoinType, WalletType
from chia.wallet.wallet_action import WalletAction
from chia.wallet.wallet_blockchain import WalletBlockchain
from chia.wallet.wallet_coin_record import WalletCoinRecord
from chia.wallet.wallet_coin_store import WalletCoinStore
from chia.wallet.wallet_interested_store import WalletInterestedStore
from chia.wallet.wallet_pool_store import WalletPoolStore
from chia.wallet.wallet_puzzle_store import WalletPuzzleStore
from chia.wallet.wallet_retry_store import WalletRetryStore
from chia.wallet.wallet_transaction_store import WalletTransactionStore
from chia.wallet.wallet_user_store import WalletUserStore
from chia.wallet.wallets.abstract_wallet import AbstractWallet
from chia.wallet.wallets.clawback_wallet import ClawbackWallet
from chia.wallet.wallets.dao_wallet.dao_wallet import DAOWallet
from chia.wallet.wallets.data_layer_wallet.data_layer_wallet import DataLayerWallet
from chia.wallet.wallets.did_wallet.did_wallet import DIDWallet
from chia.wallet.wallets.nft_wallet.nft_wallet import NFTWallet
from chia.wallet.wallets.pool_wallet.pool_wallet import PoolWallet
from chia.wallet.wallets.vc_wallet.vc_wallet import VCWallet
from chia.wallet.wallets.wallet_node_api import WalletNodeAPI
from chia.wallet.wallets.watch_wallet import WatchWallet


class WalletNode:
    _segment_validation_lock: ClassVar = asyncio.Lock()

    key_config: Dict[str, Any]
    config: Dict[str, Any]
    constants: ConsensusConstants
    server: Optional[ChiaServer]
    log: logging.Logger
    # Maintains the state of the wallet (blockchain and transactions), handles DB connections
    wallet_state_manager: Optional[Any]

    # The path to the wallet_state_manager DB
    db_path: Path
    # The path to the standard wallet keys
    keychain_proxy: Optional[KeychainProxy]
    # Stores all wallet peers we've connected to
    wallet_peers: Optional[WalletPeers]
    # Caches all wallet peers we've connected to
    peer_request_cache: PeerRequestCache
    # Handles syncing the wallet with the blockchain
    sync_task: Optional[asyncio.Task[None]]
    logged_in: bool
    # Interval for logging wallet sync progress
    sync_progress_log_interval: int
    # A map from wallet type to wallet constructor
    wallet_constructors: Dict[WalletType, Any]

    # Whether to skip state_changed messages, used to modify behaviour for tests
    _enable_notifications: bool

    _shut_down: bool
    root_path: Path
    state_changed_callback: Optional[StateChangedProtocol] = None
    wallet_node_api: Optional[WalletNodeAPI] = None
    _new_peak_queue: Optional[NewPeakQueue] = None
    full_node_peer: Optional[PeerInfo] = None
    wallet_peers_initialized: asyncio.Event
    _wallet_tasks: List[asyncio.Task[None]]
    _process_new_subscriptions_task: Optional[asyncio.Task[None]] = None
    _retry_failed_transactions_task: Optional[asyncio.Task[None]] = None
    _secondary_peer_tasks: Dict[bytes32, asyncio.Task[None]]
    node_id: bytes32

    def __init__(
        self,
        config: Dict[str, Any],
        root_path: Path,
        consensus_constants: ConsensusConstants,
        name: str = None,
        local_keychain: Optional[Keychain] = None,
    ):
        self.config = config
        self.constants = consensus_constants
        self.root_path = root_path
        self.log = logging.getLogger(name if name else __name__)
        # Normal operation data
        self.cached_blocks: Dict = {}
        self.future_block_hashes: Dict = {}
        self.keychain_proxy = None
        self.wallet_state_manager = None
        self.server = None
        self.wsm_close_task = None
        self.sync_task = None
        self.logged_in = False
        self.wallet_peers = None
        self._shut_down = False
        self.node_id = std_hash(b"wallet-node")
        self.wallet_node_api = None
        self.wallet_constructors = {
            WalletType.STANDARD_WALLET: None,
            WalletType.ATOMIC_SWAP: None,
            WalletType.AUTHORIZED_PAYEE: None,
            WalletType.MULTI_SIG: None,
            WalletType.CUSTODY: None,
            WalletType.CAT: None,
            WalletType.DECENTRALIZED_ID: DIDWallet,
            WalletType.POOLING_WALLET: PoolWallet,
            WalletType.NFT: NFTWallet,
            WalletType.DATA_LAYER: DataLayerWallet,
            WalletType.DAO: DAOWallet,
            WalletType.VC: VCWallet,
            WalletType.CLAWBACK: ClawbackWallet,
            WalletType.WATCH: WatchWallet,
        }
        self._enable_notifications = True
        self.wallet_peers_initialized = asyncio.Event()
        self.sync_progress_log_interval = 5 * 60
        self._secondary_peer_tasks = {}
        self._wallet_tasks = []
        self._new_peak_queue = None
        self.local_keychain = local_keychain
        self.peer_request_cache = PeerRequestCache()

    async def ensure_keychain_proxy(self) -> KeychainProxy:
        if self.keychain_proxy is None:
            if self.local_keychain:
                self.keychain_proxy = wrap_local_keychain(self.local_keychain, log=self.log)
            else:
                self.keychain_proxy = await connect_to_keychain_and_validate(self.root_path, self.log)
                if not self.keychain_proxy:
                    raise KeychainProxyConnectionFailure()
        return self.keychain_proxy

    def get_connections(self, request_node_type: Optional[NodeType]) -> List[Dict[str, Any]]:
        return default_get_connections(server=self.server, request_node_type=request_node_type)

    async def _start_with_fingerprint(self, fingerprint: int) -> bool:
        try:
            await self.ensure_keychain_proxy()
            await self.get_key_for_fingerprint(fingerprint)
        except KeychainIsEmpty:
            self.log.warning("No keys present. Create keys with the UI, or with the 'chia keys' program.")
            return False
        except KeychainKeyNotFound:
            self.log.warning(f"Key not found for fingerprint {fingerprint}")
            return False
        except KeychainIsLocked:
            self.log.warning("Keyring is locked")
            return False
        except KeychainProxyConnectionFailure:
            self.log.warning("Failed to connect to keychain service")
            return False
        return True

    async def _start(
        self,
        fingerprint: Optional[int] = None,
        new_wallet: bool = False,
        skip_sync: bool = False,
        wallet_peers_initialized_callback: Optional[callable] = None,
    ) -> bool:
        # Makes sure the coin_store, puzzle_store, and user_store exist in the DB
        if fingerprint is not None:
            result = await self._start_with_fingerprint(fingerprint)
            if not result:
                return False
        else:
            self.log.info("Not logging in. GUI will handle login")
            self.logged_in = False

        # Start the wallet node server
        if not await self.start_server():
            return False

        # Attempt to connect to the trusted full node
        full_node_peer = await self.get_full_node_peer()
        if full_node_peer is None:
            self.log.warning("Could not connect to the trusted full node peer. Wallet will not be able to sync.")
        else:
            self.full_node_peer = full_node_peer
            # Wallet is connected to full_node
            trusted_peer = full_node_peer

            if trusted_peer.peer_server_port is not None:
                peer_info = PeerInfo(trusted_peer.peer_host, trusted_peer.peer_server_port)
                await self.server.start_client(peer_info, None)

        if self.wallet_peers is None:
            self.initialize_wallet_peers()

        if wallet_peers_initialized_callback is not None:
            await wallet_peers_initialized_callback()

        if fingerprint is not None:
            await self.log_in(fingerprint, skip_sync=skip_sync)

        return True

    def _close(self) -> None:
        self._shut_down = True
        self.log.info("Wallet Node shutdown requested")

        if self._new_peak_queue is not None:
            self._new_peak_queue.stop()

        if self.wallet_state_manager is not None:
            self.wallet_state_manager.set_sync_mode(False)

        for task in self._wallet_tasks:
            task.cancel()
        if self._process_new_subscriptions_task is not None:
            self._process_new_subscriptions_task.cancel()
        if self._retry_failed_transactions_task is not None:
            self._retry_failed_transactions_task.cancel()
        for task in self._secondary_peer_tasks.values():
            task.cancel()

    async def _await_closed(self, shutting_down: bool = True) -> None:
        if self.server is not None:
            await self.server.close_all()
        if self.wallet_state_manager is not None:
            await self.wallet_state_manager.close()
            self.wallet_state_manager = None
        if shutting_down and self.keychain_proxy is not None:
            proxy = self.keychain_proxy
            self.keychain_proxy = None
            await proxy.close()
            await asyncio.sleep(0.5)  # https://github.com/python/cpython/issues/84609

    def _set_state_changed_callback(self, callback: StateChangedProtocol) -> None:
        self.state_changed_callback = callback

    async def on_connect(self, connection: WSChiaConnection) -> None:
        if self.wallet_state_manager is None:
            return None

        if connection.connection_type is NodeType.FULL_NODE:
            if self.full_node_peer is None:
                self.full_node_peer = connection.peer_info
            await self.wallet_state_manager.blockchain.warmup(self.constants.WEIGHT_PROOF_RECENT_BLOCKS)
            if self.wallet_state_manager.blockchain.synced_weight_proof is not None:
                await self.wallet_state_manager.create_more_puzzle_hashes()

            # Request initial coin state
            self.wallet_state_manager.set_sync_mode(True)
            async with self._segment_validation_lock:
                peak = await self.wallet_state_manager.blockchain.get_peak_block()
                peak_height = peak.height if peak is not None else 0
                if peak_height == 0:
                    # We're not synced, defer the initial coin state to sync_job
                    return None

                if self._new_peak_queue is not None:
                    self._new_peak_queue.put(
                        NewPeakItem(
                            peak.header_hash,
                            peak.height,
                            peak.weight,
                            peak.fork_point_with_previous_peak,
                            peak_height,
                            [],
                            [],
                        )
                    )
                    return None

                state = self.wallet_state_manager.state_manager.synced_states[0]
                self.log.info(f"Requesting initial coin state at {state}")
                request = wallet_protocol.RegisterForPhUpdates(
                    [state],
                    0,
                )
                response = await connection.call_api(ProtocolMessageTypes.register_interest_in_puzzle_hash, request)
                if not isinstance(response, RespondToPhUpdates):
                    self.log.error(f"unexpected response from register_interest_in_puzzle_hash: {response}")
                    return None
                for coin_state in response.coin_states:
                    await self.wallet_state_manager.add_coin_states(
                        [coin_state],
                        peer_id=connection.peer_node_id,
                        fork_height=peak_height,
                    )
                self.wallet_state_manager.set_sync_mode(False)

    async def _on_disconnect(self, peer_id: bytes32) -> None:
        if peer_id in self._secondary_peer_tasks:
            task = self._secondary_peer_tasks[peer_id]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            del self._secondary_peer_tasks[peer_id]

        if self._new_peak_queue is not None:
            await self._new_peak_queue.cancel_duplicate_peaks(peer_id)

    def _add_state_changed_callback(self, callback: StateChangedProtocol) -> None:
        if self.wallet_state_manager is not None:
            self.wallet_state_manager.set_callback(callback)
        self.state_changed_callback = callback

    async def get_key_for_fingerprint(self, fingerprint: Optional[int]) -> Optional[PrivateKey]:
        try:
            keychain_proxy = await self.ensure_keychain_proxy()
            # Returns first private key if fingerprint is None
            key = await keychain_proxy.get_key_for_fingerprint(fingerprint)
        except KeychainIsEmpty:
            self.log.warning("No keys present. Create keys with the UI, or with the 'chia keys' program.")
            return None
        except KeychainKeyNotFound:
            self.log.warning(f"Key not found for fingerprint {fingerprint}")
            return None
        except KeychainIsLocked:
            self.log.warning("Keyring is locked")
            return None
        except KeychainProxyConnectionFailure:
            self.log.warning("Failed to connect to keychain service")
            return None
        return key

    async def get_private_key(self, fingerprint: Optional[int]) -> Optional[PrivateKey]:
        """
        Attempt to get the private key for the given fingerprint. If the fingerprint is None,
        get_key_for_fingerprint() will return the first private key. Similarly to get_key_for_fingerprint(), this
        function can also raise any of the KeychainProxy exceptions.
        """
        key = await self.get_key_for_fingerprint(fingerprint)
        if key is None:
            return None
        return key

    async def log_in(self, fingerprint: int, skip_sync: bool = False) -> bool:
        key = await self.get_private_key(fingerprint)
        if key is None:
            return False

        await self.close_wallet()
        await self.initialize_wallet(key, fingerprint, skip_sync)
        return True

    def initialize_wallet_peers(self) -> None:
        self.wallet_peers = WalletPeers(
            self.server,
            self.config,
            self.log,
            self.get_wallet_peers_paths(),
            self.get_trusted_peer_ids(),
            self.wallet_peers_initialized.set,
        )

    def get_trusted_peer_ids(self) -> Set[bytes32]:
        trusted_peers: Dict[str, Any] = self.config.get("trusted_peers", {})
        trusted_peer_ids: Set[bytes32] = set()
        if trusted_peers is not None:
            for trusted_peer_id, _ in trusted_peers.items():
                trusted_peer_ids.add(bytes32.from_hexstr(trusted_peer_id))
        return trusted_peer_ids

    def get_wallet_peers_paths(self) -> List[Path]:
        return [path_from_root(self.root_path, "wallet/db/wallet_peers.dat")]

    async def get_full_node_peer(self) -> Optional[PeerInfo]:
        trusted_peers: Dict[str, Any] = self.config.get("trusted_peers", {})
        if len(trusted_peers) == 0:
            return None
        full_node_peer_id = list(trusted_peers.keys())[0]
        full_node_peer_config = trusted_peers[full_node_peer_id]
        host = full_node_peer_config["host"]
        port = full_node_peer_config["port"]
        return PeerInfo(host, port)

    async def close_wallet(self) -> None:
        if self.wallet_state_manager is not None:
            await self.wallet_state_manager.close()
            self.wallet_state_manager = None

    async def initialize_wallet(
        self, key: PrivateKey, fingerprint: int, skip_sync: bool = False, new_wallet: bool = False
    ) -> None:
        db_path_key_suffix = str(fingerprint)
        db_path_replaced: str = (
            self.config["database_path"]
            .replace("CHALLENGE", self.config["selected_network"])
            .replace("KEY", db_path_key_suffix)
        )
        path = path_from_root(self.root_path, db_path_replaced)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = path
        self.log.info(f"Initializing a wallet with path: {path}")

        self.wallet_state_manager = await WalletStateManager.create(
            self.constants,
            self.config,
            path,
            key,
            self.log,
            self,
        )

        if self.state_changed_callback is not None:
            self.wallet_state_manager.set_callback(self.state_changed_callback)

        self.wallet_node_api = WalletNodeAPI(self)
        self.logged_in = True
        self.wallet_state_manager.set_pending_callback(self._pending_tx_handler)
        self._shut_down = False

        if self._new_peak_queue is None:
            self._new_peak_queue = NewPeakQueue(self)

        self._process_new_subscriptions_task = asyncio.create_task(self._process_new_subscriptions())
        self._retry_failed_transactions_task = asyncio.create_task(self._retry_failed_transactions())

        if not skip_sync:
            if self.wallet_peers is None:
                self.initialize_wallet_peers()

            await self.wallet_peers_initialized.wait()
            self._wallet_tasks.append(asyncio.create_task(self.sync_job()))

    async def _process_new_subscriptions(self) -> None:
        while not self._shut_down:
            # Here we process four types of messages in the queue, where the first one has higher priority (lower
            # number in the queue), and priority decreases for each type.
            peer: Optional[WSChiaConnection] = None
            try:
                item = await self.wallet_state_manager.new_peak_queue.get()
                self.wallet_state_manager.state_changed("new_block")
                if item.type == NewPeakQueueTypes.COIN_ID_SUBSCRIPTION:
                    self.log.debug(f"Process coin ID subscription: {item.data}")
                    coin_ids: List[bytes32] = item.data
                    for peer in self.server.get_connections(NodeType.FULL_NODE):
                        coin_states: List[CoinState] = await subscribe_to_coin_updates(
                            coin_ids, peer, uint32(0), self.log
                        )
                        if len(coin_states) > 0:
                            async with self._segment_validation_lock:
                                await self.wallet_state_manager.add_coin_states(
                                    coin_states, peer.peer_node_id, item.height
                                )
                elif item.type == NewPeakQueueTypes.PUZZLE_HASH_SUBSCRIPTION:
                    self.log.debug(f"Process puzzle hash subscription: {item.data}")
                    puzzle_hashes: List[bytes32] = item.data
                    for peer in self.server.get_connections(NodeType.FULL_NODE):
                        coin_states: List[CoinState] = await subscribe_to_phs(puzzle_hashes, peer, uint32(0), self.log)
                        if len(coin_states) > 0:
                            async with self._segment_validation_lock:
                                await self.wallet_state_manager.add_coin_states(
                                    coin_states, peer.peer_node_id, item.height
                                )
                elif item.type == NewPeakQueueTypes.FULL_NODE_PEER_UPDATED:
                    try:
                        # If we have received a peer update, and we have not connected to any peers yet, connect
                        # to the received peer. This allows a wallet to connect to the full node, even if it cannot
                        # access the peer DB (for example, if Chia is installed from binary and the wallet is started
                        # separately).
                        if len(self.server.get_connections(NodeType.FULL_NODE)) == 0:
                            trusted_peer = item.data
                            self.log.info(f"Attempting connection with trusted peer: {trusted_peer}")
                            if trusted_peer.peer_server_port is not None:
                                peer_info = PeerInfo(trusted_peer.peer_host, trusted_peer.peer_server_port)
                                await self.server.start_client(peer_info, None)
                    except Exception as e:
                        self.log.error(f"Exception connecting to trusted peer: {e}")
                elif item.type == NewPeakQueueTypes.REQUEST_PUZZLE_SOLUTION:
                    coin_id: bytes32 = item.data[0]
                    height: uint32 = item.data[1]
                    peer = self.get_full_node_peer()
                    if peer is None:
                        self.log.warning(f"No peer to send request for puzzle solution {coin_id}, {height}")
                        continue
                    coin_states: List[CoinState] = await subscribe_to_coin_updates(
                        [coin_id], peer, height, self.log, None
                    )
                    if len(coin_states) > 0:
                        async with self._segment_validation_lock:
                            await self.wallet_state_manager.add_coin_states(coin_states, peer.peer_node_id, height)
                elif item.type == NewPeakQueueTypes.NEW_PEAK_WALLET:
                    self.log.debug(
                        f"Start processing new peak for wallet: {item.height}, fork point: {item.fork_height}"
                    )
                    await self.new_peak_wallet(item)
                    self.log.debug(f"Finish processing new peak for wallet: {item.height}")
                else:
                    self.log.debug(f"Unknown item in queue: {item}")
            except asyncio.CancelledError:
                self.log.warning("Queue task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception handling {item}, error: {e}")
                if peer is not None:
                    await peer.close(9999)

    async def new_peak_wallet(self, new_peak: NewPeakItem) -> None:
        if self.wallet_state_manager is None:
            return

        async with self._segment_validation_lock:
            peak_height = new_peak.height
            header_hash = new_peak.header_hash
            fork_height = new_peak.fork_height
            if fork_height == peak_height - 1:
                # This happens when we are receiving blocks sequentially
                await self.wallet_state_manager.blockchain.set_peak_block(header_hash, peak_height)
            else:
                # This happens when we are receiving blocks out of order
                await self.wallet_state_manager.blockchain.add_block(header_hash, peak_height)

            # Check if we need to add any new puzzle hashes to the puzzle_hash_subscription
            await self.wallet_state_manager.add_interested_puzzle_hashes()

            # Check if we need to add any new coin ids to the coin_subscription
            await self.wallet_state_manager.add_interested_coin_ids()

            added_coins, removed_coins = await self.wallet_state_manager.get_all_additions_and_removals(header_hash)
            if len(added_coins) > 0 or len(removed_coins) > 0:
                self.log.debug(
                    f"Received {len(added_coins)} added coins and {len(removed_coins)} removed coins in peak {peak_height}"
                )
                await self.wallet_state_manager.coins_of_interest_added(added_coins, header_hash)
                await self.wallet_state_manager.coins_of_interest_removed(removed_coins, header_hash)
            self.wallet_state_manager.state_changed("new_block")

    async def _retry_failed_transactions(self) -> None:
        while not self._shut_down:
            try:
                await asyncio.sleep(self.config.get("tx_retry_sleep_interval", 600))
                if self.wallet_state_manager is None:
                    continue
                failed_txs = await self.wallet_state_manager.tx_store.get_failed_transactions()
                for tx in failed_txs:
                    if tx.type in [
                        TransactionRecord.Type.OUTGOING_TX,
                        TransactionRecord.Type.OUTGOING_TRADE,
                        TransactionRecord.Type.INCOMING_TRADE,
                        TransactionRecord.Type.CLAWBACK,
                        TransactionRecord.Type.CLAWBACK_SEND,
                        TransactionRecord.Type.CLAWBACK_INCOMING,
                    ]:
                        await self.wallet_state_manager.retry_transaction(tx)
            except asyncio.CancelledError:
                self.log.warning("Retry failed transactions task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception in retry failed transactions: {e}")

    async def _pending_tx_handler(self) -> None:
        if self._shut_down or self.wallet_state_manager is None:
            return
        pending_txs = await self.wallet_state_manager.tx_store.get_all_pending_transactions()
        for tx in pending_txs:
            try:
                if tx.spend_bundle is None:
                    self.log.warning(f"Pending transaction {tx.name} has no spend bundle")
                    continue
                self.log.debug(f"Pending transaction {tx.name}")
                if self.wallet_state_manager is None:
                    continue
                wallet = self.wallet_state_manager.wallets[tx.wallet_id]
                if wallet.type() == WalletType.CLAWBACK:
                    await self.wallet_state_manager.add_pending_transaction(tx)
                    continue
                if wallet.type() == WalletType.NFT:
                    await self.wallet_state_manager.add_pending_transaction(tx)
                    continue
                if wallet.type() == WalletType.DAO:
                    await self.wallet_state_manager.add_pending_transaction(tx)
                    continue
                if wallet.type() == WalletType.VC:
                    await self.wallet_state_manager.add_pending_transaction(tx)
                    continue
                if wallet.type() == WalletType.DATA_LAYER:
                    await self.wallet_state_manager.add_pending_transaction(tx)
                    continue
                if wallet.type() == WalletType.DECENTRALIZED_ID:
                    await self.wallet_state_manager.add_pending_transaction(tx)
                    continue
                await self.wallet_state_manager.add_pending_transaction(tx)
            except Exception as e:
                self.log.error(f"Exception while handling pending transactions: {e}")

    async def get_all_wallet_info_entries(self, fingerprint: Optional[int] = None) -> List[Dict[str, Any]]:
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        result = []
        for key, value in self.config["wallet"].items():
            if key == "network_overrides" or key == "settings":
                continue
            if fingerprint is not None and value.get("fingerprint", None) != fingerprint:
                continue
            result.append(value.copy())
        return result

    async def get_wallet_config(self, fingerprint: int) -> Dict[str, Any]:
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        config = {}
        for key, value in self.config["wallet"].items():
            if key == "network_overrides" or key == "settings":
                continue
            if value.get("fingerprint", None) == fingerprint:
                config = value.copy()
        return config

    async def get_private_key(self, fingerprint: int) -> Optional[PrivateKey]:
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        private_key = await self.keychain_proxy.get_key_for_fingerprint(fingerprint)
        return private_key

    async def get_sync_status(self) -> bool:
        if self.wallet_state_manager is None:
            return False
        synced = await self.wallet_state_manager.synced()
        return synced

    async def get_next_interesting_coin_ids(self, up_to_height: Optional[uint32] = None) -> List[bytes32]:
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.interested_store.get_next_coin_ids(up_to_height)
        return result

    async def get_timestamp_for_height(self, height: uint32) -> uint64:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        if height >= self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            return uint64(height)

        if self.wallet_state_manager is None:
            raise ValueError("The wallet service is not initialized")

        for i in range(height, -1, -1):
            if i == 0:
                return uint64(self.constants.GENESIS_CHALLENGE_INITIALIZED_TIMESTAMP)
            block = await self.wallet_state_manager.blockchain.get_header_block_record(uint32(i))
            if block is not None and block.is_transaction_block:
                return block.timestamp

        raise ValueError(f"No transaction block found for height {height}")

    async def get_height_for_timestamp(self, timestamp: uint64) -> uint32:
        """
        Returns the height of the first block with timestamp > timestamp
        and that has a timestamp
        """
        if timestamp < self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            blocks = await self.wallet_state_manager.blockchain.get_header_blocks_in_range(0, timestamp)
            for i in range(0, len(blocks)):
                if blocks[i].is_transaction_block and blocks[i].timestamp > timestamp:
                    return uint32(blocks[i].height)
            return uint32(0)
        else:
            return uint32(timestamp)

    async def _start_with_fingerprint(self, fingerprint: int) -> bool:
        try:
            await self.ensure_keychain_proxy()
            await self.get_key_for_fingerprint(fingerprint)
        except KeychainIsEmpty:
            self.log.warning("No keys present. Create keys with the UI, or with the 'chia keys' program.")
            return False
        except KeychainKeyNotFound:
            self.log.warning(f"Key not found for fingerprint {fingerprint}")
            return False
        except KeychainIsLocked:
            self.log.warning("Keyring is locked")
            return False
        except KeychainProxyConnectionFailure:
            self.log.warning("Failed to connect to keychain service")
            return False
        return True

    async def start_server(self) -> bool:
        try:
            self.config["start_rpc_server"] = True
            self.config["rpc_port"] = self.config.get("rpc_port", 9256)
            self.server = await ChiaServer.create(
                self.config["port"],
                self.config,
                self.root_path,
                self.wallet_node_api,
                self.node_id,
                None,
                (self.log, self.log),
                self.get_wallet_peers_paths(),
                self.get_trusted_peer_ids(),
                introducer_peers=None,
                node_type=NodeType.WALLET,
                peer_api=None,
                peer_server_close_callback=self._on_disconnect,
            )
        except Exception as e:
            self.log.error(f"Failed to create wallet server: {e}")
            return False
        return True

    async def start(
        self,
        fingerprint: Optional[int] = None,
        new_wallet: bool = False,
        skip_sync: bool = False,
        wallet_peers_initialized_callback: Optional[callable] = None,
    ) -> bool:
        try:
            if not await self._start(fingerprint, new_wallet, skip_sync, wallet_peers_initialized_callback):
                return False
        except Exception as e:
            tb = traceback.format_exc()
            self.log.error(f"Error while starting wallet: {e} {tb}")
            raise
        return True

    async def start_client(
        self,
        fingerprint: Optional[int] = None,
        new_wallet: bool = False,
        skip_sync: bool = False,
        wallet_peers_initialized_callback: Optional[callable] = None,
    ) -> bool:
        try:
            if not await self._start(fingerprint, new_wallet, skip_sync, wallet_peers_initialized_callback):
                return False
        except Exception as e:
            tb = traceback.format_exc()
            self.log.error(f"Error while starting wallet: {e} {tb}")
            raise
        return True

    @property
    def is_trusted(self) -> bool:
        return self.config.get("trusted_daemon", False)

    def get_full_node_peer(self) -> Optional[WSChiaConnection]:
        """
        Get a full node, preferring the trusted one if configured
        """
        full_nodes: List[WSChiaConnection] = self.server.get_connections(NodeType.FULL_NODE)
        if len(full_nodes) == 0:
            return None

        # Check if the trusted node we specify is available
        trusted_peer_id = self.get_trusted_peer_ids()
        if len(trusted_peer_id) > 0:
            for peer_id in trusted_peer_id:
                for peer in full_nodes:
                    if peer.peer_node_id == peer_id:
                        return peer
        else:
            return full_nodes[0]
        return None

    async def get_timestamp_for_height_from_peer(
        self, height: uint32, peer: WSChiaConnection
    ) -> Optional[uint64]:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        for i in range(height, -1, -1):
            if i == 0:
                return uint64(self.constants.GENESIS_CHALLENGE_INITIALIZED_TIMESTAMP)
            request = RequestBlockHeader(uint32(i))
            response: Optional[RespondBlockHeader] = await peer.call_api(
                ProtocolMessageTypes.request_block_header, request
            )
            if response is None:
                return None
            header_block = HeaderBlock.from_bytes(response.header_block)
            if header_block.is_transaction_block:
                return header_block.foliage_transaction_block.timestamp
        return None

    async def get_timestamp_for_height_from_peers(self, height: uint32) -> Optional[uint64]:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        if height >= self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            return uint64(height)

        full_node_peer = self.get_full_node_peer()
        if full_node_peer is None:
            self.log.warning("Cannot fetch timestamp, no peers")
            return None
        timestamp = await self.get_timestamp_for_height_from_peer(height, full_node_peer)
        if timestamp is None:
            self.log.warning(f"Timestamp lookup failed for height {height}")
            return None
        return timestamp

    async def new_peak_wallet(self, peak: NewPeakItem) -> None:
        if self.wallet_state_manager is None:
            return

        async with self._segment_validation_lock:
            peak_height = peak.height
            header_hash = peak.header_hash
            fork_height = peak.fork_height
            if fork_height == peak_height - 1:
                # This happens when we are receiving blocks sequentially
                await self.wallet_state_manager.blockchain.set_peak_block(header_hash, peak_height)
            else:
                # This happens when we are receiving blocks out of order
                await self.wallet_state_manager.blockchain.add_block(header_hash, peak_height)

            # Check if we need to add any new puzzle hashes to the puzzle_hash_subscription
            await self.wallet_state_manager.add_interested_puzzle_hashes()

            # Check if we need to add any new coin ids to the coin_subscription
            await self.wallet_state_manager.add_interested_coin_ids()

            added_coins, removed_coins = await self.wallet_state_manager.get_all_additions_and_removals(header_hash)
            if len(added_coins) > 0 or len(removed_coins) > 0:
                self.log.debug(
                    f"Received {len(added_coins)} added coins and {len(removed_coins)} removed coins in peak {peak_height}"
                )
                await self.wallet_state_manager.coins_of_interest_added(added_coins, header_hash)
                await self.wallet_state_manager.coins_of_interest_removed(removed_coins, header_hash)
            self.wallet_state_manager.state_changed("new_block")

    async def add_states_from_peer(
        self,
        coin_state: List[CoinState],
        peer: WSChiaConnection,
        fork_height: Optional[uint32] = None,
    ) -> None:
        if self.wallet_state_manager is None:
            return
        try:
            async with self._segment_validation_lock:
                await self.wallet_state_manager.add_coin_states(coin_state, peer.peer_node_id, fork_height)
        except Exception as e:
            self.log.error(f"add_states_from_peer failed: {e}")

    async def disconnect_and_stop_wpeers(self) -> None:
        if self.wallet_peers is not None:
            await self.wallet_peers.ensure_is_closed()
            self.wallet_peers = None

    async def disconnect_all_peers(self) -> None:
        if self.server is not None:
            connections = self.server.get_connections(NodeType.FULL_NODE)
            for connection in connections:
                await connection.close()

    def set_server(self, server: ChiaServer) -> None:
        self.server = server
        self.initialize_wallet_peers()

    def initialize_wallet_peers(self) -> None:
        self.server.on_connect = self.on_connect
        network_name = self.config["selected_network"]
        self.wallet_peers = WalletPeers(
            self.server,
            self.config,
            self.log,
            self.get_wallet_peers_paths(),
            self.get_trusted_peer_ids(),
            self.wallet_peers_initialized.set,
        )
        asyncio.create_task(self.wallet_peers.start())

    async def get_wallet_id_for_puzzle_hash(self, puzzle_hash: bytes32) -> Optional[Tuple[uint32, WalletType]]:
        if self.wallet_state_manager is None:
            return None
        wallet_id = await self.wallet_state_manager.get_wallet_id_for_puzzle_hash(puzzle_hash)
        return wallet_id

    async def get_wallet_id_for_coin(self, coin_id: bytes32) -> Optional[Tuple[uint32, WalletType]]:
        if self.wallet_state_manager is None:
            return None
        wallet_id = await self.wallet_state_manager.get_wallet_id_for_coin(coin_id)
        return wallet_id

    async def _update_pool_state_task(self, timestamp: uint64) -> None:
        if self.wallet_state_manager is None:
            return
        await self.wallet_state_manager.update_pool_state()

    async def _new_peak_queue_worker(self) -> None:
        while not self._shut_down:
            try:
                item: NewPeakItem = await self._new_peak_queue.get()
                await self.new_peak_wallet(item)
                self._new_peak_queue.task_done()
            except asyncio.CancelledError:
                self.log.warning("Queue task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception in new peak queue worker: {e}")

    async def new_peak(self, request: wallet_protocol.NewPeak) -> None:
        if self._new_peak_queue is None:
            self.log.warning("New peak queue is None, ignoring new peak")
            return
        if self.wallet_state_manager is None:
            self.log.warning("Wallet state manager is None, ignoring new peak")
            return
        if await self.wallet_state_manager.synced() is False:
            self.log.warning("Wallet not synced, ignoring new peak")
            return

        peak_item = NewPeakItem(
            request.header_hash,
            request.height,
            request.weight,
            request.fork_point_with_previous_peak,
            request.height,
            [],
            [],
        )
        self._new_peak_queue.put(peak_item)

    async def add_interested_puzzle_hashes(
        self, puzzle_hashes: List[bytes32], wallet_ids: List[int], from_height: uint32 = uint32(0)
    ) -> None:
        if self.wallet_state_manager is None:
            return
        for puzzle_hash, wallet_id in zip(puzzle_hashes, wallet_ids):
            await self.wallet_state_manager.add_interested_puzzle_hash(puzzle_hash, wallet_id, from_height)
        if len(puzzle_hashes) > 0:
            await self.wallet_state_manager.add_interested_puzzle_hashes()

    async def add_interested_coin_ids(self, coin_ids: List[bytes32], from_height: uint32 = uint32(0)) -> None:
        if self.wallet_state_manager is None:
            return
        for coin_id in coin_ids:
            await self.wallet_state_manager.add_interested_coin_id(coin_id, from_height)
        if len(coin_ids) > 0:
            await self.wallet_state_manager.add_interested_coin_ids()

    async def process_state_changes(
        self,
        state_changes: List[CoinState],
        peer: WSChiaConnection,
        fork_height: Optional[uint32] = None,
    ) -> None:
        if self.wallet_state_manager is None:
            return
        async with self._segment_validation_lock:
            await self.wallet_state_manager.add_coin_states(state_changes, peer.peer_node_id, fork_height)

    async def get_initial_confirmed_height(self) -> int:
        if self.wallet_state_manager is None:
            return -1
        return await self.wallet_state_manager.blockchain.get_finished_sync_up_to()

    async def get_confirmed_height(self) -> int:
        if self.wallet_state_manager is None:
            return -1
        return await self.wallet_state_manager.blockchain.get_finished_sync_up_to()

    async def get_peak(self) -> Optional[HeaderBlock]:
        if self.wallet_state_manager is None:
            return None
        peak = self.wallet_state_manager.blockchain.get_peak()
        if peak is None:
            return None
        block = await self.wallet_state_manager.blockchain.get_header_block(peak)
        return block

    async def get_peak_height(self) -> Optional[uint32]:
        if self.wallet_state_manager is None:
            return None
        peak = self.wallet_state_manager.blockchain.get_peak()
        if peak is None:
            return None
        return peak.height

    async def get_latest_singleton_coin_from_peer(
        self,
        peer: WSChiaConnection,
        launcher_id: bytes32,
        only_confirmed: bool = False,
    ) -> Optional[Coin]:
        """Get the latest singleton from a peer for the launcher ID"""
        if self.wallet_state_manager is None:
            return None

        coin_state_list: List[CoinState] = await subscribe_to_coin_updates(
            [launcher_id], peer, uint32(0), self.log, None
        )
        if coin_state_list is None:
            self.log.warning(f"Cannot find singleton {launcher_id.hex()} in the blockchain")
            return None

        launcher_coin_state: Optional[CoinState] = None
        for coin_state in coin_state_list:
            if coin_state.coin.name() == launcher_id:
                launcher_coin_state = coin_state
                break
        if launcher_coin_state is None:
            self.log.warning(f"Cannot find launcher {launcher_id.hex()} in the blockchain")
            return None

        coin_states = await request_and_validate_additions(
            peer, self.wallet_state_manager.blockchain, [launcher_coin_state.coin.name()], self.log
        )
        if coin_states is None:
            self.log.warning(f"Cannot find launcher {launcher_id.hex()} in the blockchain")
            return None

        for coin_state in coin_states:
            if coin_state.coin.parent_coin_info == launcher_id:
                return coin_state.coin

        self.log.warning(f"Cannot find child of launcher {launcher_id.hex()} in the blockchain")
        return None

    async def get_next_interesting_coin_ids(self, up_to_height: Optional[uint32] = None) -> List[bytes32]:
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.interested_store.get_next_coin_ids(up_to_height)
        return result

    async def get_cactus_connection(self) -> Optional[WSChiaConnection]:
        if self.server is None:
            return None
        connections = self.server.get_connections(NodeType.FULL_NODE)
        if len(connections) == 0:
            return None
        return connections[0]

    async def get_all_transactions(self, wallet_id: int) -> List[TransactionRecord]:
        if self.wallet_state_manager is None:
            return []
        return await self.wallet_state_manager.tx_store.get_all_transactions_for_wallet(wallet_id)

    async def get_transaction(self, wallet_id: int, transaction_id: bytes32) -> Optional[TransactionRecord]:
        if self.wallet_state_manager is None:
            return None
        return await self.wallet_state_manager.tx_store.get_transaction_record(transaction_id)

    async def get_transaction_by_coin_id(self, coin_id: bytes32) -> Optional[TransactionRecord]:
        if self.wallet_state_manager is None:
            return None
        return await self.wallet_state_manager.tx_store.get_transaction_record_by_coin_id(coin_id)

    async def get_transaction_by_coin_ids(self, coin_ids: List[bytes32]) -> List[TransactionRecord]:
        if self.wallet_state_manager is None:
            return []
        return await self.wallet_state_manager.tx_store.get_transaction_records_by_coin_id(coin_ids)

    async def get_coin_records_by_coin_ids(self, coin_ids: List[bytes32]) -> List[WalletCoinRecord]:
        if self.wallet_state_manager is None:
            return []
        return await self.wallet_state_manager.coin_store.get_coin_records_by_coin_ids(coin_ids)

    async def get_spendable_coins_for_wallet(
        self, wallet_id: int, records: Optional[Set[WalletCoinRecord]] = None
    ) -> Set[WalletCoinRecord]:
        if self.wallet_state_manager is None:
            return set()
        wallet = self.wallet_state_manager.wallets[wallet_id]
        if records is None:
            records = await self.wallet_state_manager.coin_store.get_spendable_coins_for_wallet(wallet_id)
        # Ensure we return only owned coins
        return await wallet.get_confirmed_spendable_coins_for_wallet(records)

    async def get_all_coin_records_for_wallet(self, wallet_id: int) -> Set[WalletCoinRecord]:
        if self.wallet_state_manager is None:
            return set()
        result = await self.wallet_state_manager.coin_store.get_all_coin_records_for_wallet(wallet_id)
        return set(result)

    async def get_coin_records_by_puzzle_hash(self, puzzle_hash: bytes32) -> List[WalletCoinRecord]:
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.coin_store.get_coin_records_by_puzzle_hash(puzzle_hash)
        return result

    async def get_coin_records_by_puzzle_hashes(self, puzzle_hashes: List[bytes32]) -> List[WalletCoinRecord]:
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.coin_store.get_coin_records_by_puzzle_hashes(puzzle_hashes)
        return result

    async def get_coin_records_by_parent_ids(self, parent_ids: List[bytes32]) -> List[WalletCoinRecord]:
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.coin_store.get_coin_records_by_parent_ids(parent_ids)
        return result

    async def get_additions_for_block(self, block_path: Path) -> Optional[List[Coin]]:
        if self.wallet_state_manager is None:
            return None
        try:
            with open(block_path, "r") as f:
                block_json = json.load(f)
        except Exception as e:
            self.log.warning(f"Could not load block {block_path}: {e}")
            return None
        try:
            header_hash = bytes32.from_hexstr(block_json["header_hash"])
            additions: List[Coin] = []
            for coin_json in block_json["additions"]:
                coin = Coin.from_json_dict(coin_json)
                additions.append(coin)
            return additions
        except Exception as e:
            self.log.warning(f"Could not get additions from block {block_path}: {e}")
            return None

    async def get_removals_for_block(self, block_path: Path) -> Optional[List[bytes32]]:
        if self.wallet_state_manager is None:
            return None
        try:
            with open(block_path, "r") as f:
                block_json = json.load(f)
        except Exception as e:
            self.log.warning(f"Could not load block {block_path}: {e}")
            return None
        try:
            header_hash = bytes32.from_hexstr(block_json["header_hash"])
            removals: List[bytes32] = []
            for coin_json in block_json["removals"]:
                coin_name = bytes32.from_hexstr(coin_json)
                removals.append(coin_name)
            return removals
        except Exception as e:
            self.log.warning(f"Could not get removals from block {block_path}: {e}")
            return None

    async def reorg_rollback(self, height: int) -> List[uint32]:
        if self.wallet_state_manager is None:
            return []
        header_hash = await self.wallet_state_manager.blockchain.height_to_hash(uint32(height))
        return await self.wallet_state_manager.reorg_rollback(header_hash)

    async def _await_closed(self, shutting_down: bool = True) -> None:
        if self.server is not None:
            await self.server.close_all()
        if self.wallet_state_manager is not None:
            await self.wallet_state_manager.close()
            self.wallet_state_manager = None
        if shutting_down and self.keychain_proxy is not None:
            proxy = self.keychain_proxy
            self.keychain_proxy = None
            await proxy.close()
            await asyncio.sleep(0.5)  # https://github.com/python/cpython/issues/84609

    def _close(self) -> None:
        self._shut_down = True
        self.log.info("Wallet Node shutdown requested")

        if self._new_peak_queue is not None:
            self._new_peak_queue.stop()

        if self.wallet_state_manager is not None:
            self.wallet_state_manager.set_sync_mode(False)

        for task in self._wallet_tasks:
            task.cancel()
        if self._process_new_subscriptions_task is not None:
            self._process_new_subscriptions_task.cancel()
        if self._retry_failed_transactions_task is not None:
            self._retry_failed_transactions_task.cancel()
        for task in self._secondary_peer_tasks.values():
            task.cancel()

    def _prepare_full_node_peers(self) -> None:
        if self.wallet_peers is None:
            self.initialize_wallet_peers()

    async def start_network(self) -> None:
        if self.server is None:
            await self.start_server()

        self._prepare_full_node_peers()

        assert self.wallet_peers is not None
        asyncio.create_task(self.wallet_peers.start())

    async def start_server(self) -> bool:
        if self.wallet_node_api is None:
            self.wallet_node_api = WalletNodeAPI(self)
        if self.server is not None:
            return True

        self.server = await ChiaServer.create(
            self.config["port"],
            self.config,
            self.root_path,
            self.wallet_node_api,
            self.node_id,
            None,
            (self.log, self.log),
            self.get_wallet_peers_paths(),
            self.get_trusted_peer_ids(),
            introducer_peers=None,
            node_type=NodeType.WALLET,
            peer_api=None,
            peer_server_close_callback=self._on_disconnect,
        )

        self.wallet_node_api.full_node_peer_list = self.server.get_full_node_peer_list
        self.wallet_node_api.full_node_peers_info = self.server.get_full_node_peers_info
        self.wallet_node_api.set_server(self.server)
        return True

    async def ensure_is_closed(self) -> None:
        if self.is_closed():
            return
        self._close()
        await self._await_closed()

    def is_closed(self) -> bool:
        return self._shut_down

    async def stop(self) -> None:
        if self.is_closed():
            return
        self._close()
        await self._await_closed()

    async def get_connections(self, request_node_type: Optional[NodeType] = None) -> List[Dict[str, Any]]:
        if self.server is None:
            return []
        if request_node_type is None:
            request_node_type = NodeType.FULL_NODE
        connections = self.server.get_connections(request_node_type)
        con_info: List[Dict[str, Any]] = []
        if len(connections) == 0:
            return []
        for con in connections:
            con_dict: Dict[str, Any] = {
                "type": con.connection_type,
                "local_port": con.local_port,
                "peer_host": con.peer_info.host,
                "peer_port": con.peer_info.port,
                "peer_server_port": con.peer_server_port,
                "node_id": con.peer_node_id,
                "creation_time": con.creation_time,
                "bytes_read": con.bytes_read,
                "bytes_written": con.bytes_written,
                "last_message_time": con.last_message_time,
            }
            con_info.append(con_dict)
        return con_info

    async def create_account(self, account_human_name: str) -> Optional[uint32]:
        if self.wallet_state_manager is None:
            return None
        self.log.info(f"Creating wallet account: {account_human_name}")
        await self.wallet_state_manager.add_new_wallet(None, WalletType.STANDARD_WALLET, {}, account_human_name)
        return self.wallet_state_manager.main_wallet.id()

    async def get_accounts(self) -> List[str]:
        if self.wallet_state_manager is None:
            return []
        accounts = await self.wallet_state_manager.user_store.get_all_user_info()
        return [account.name for account in accounts]

    async def get_wallet_for_colour(self, colour: str) -> Optional[WalletProtocol]:
        if self.wallet_state_manager is None:
            return None
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                if wallet.get_asset_id().hex() == colour:
                    return wallet
        return None

    async def get_wallet_for_asset_id(self, asset_id: str) -> Optional[WalletProtocol]:
        if self.wallet_state_manager is None:
            return None
        for _, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                if wallet.get_asset_id().hex() == asset_id:
                    return wallet
            elif wallet.type() == WalletType.NFT:
                assert isinstance(wallet, NFTWallet)
                if bytes32.from_hexstr(asset_id) == wallet.get_launcher_id():
                    return wallet
            elif wallet.type() == WalletType.DATA_LAYER:
                assert isinstance(wallet, DataLayerWallet)
                if bytes32.from_hexstr(asset_id) == wallet.get_launcher_id():
                    return wallet
        return None

    async def get_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo) -> Optional[WalletProtocol]:
        if self.wallet_state_manager is None:
            return None
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT and puzzle_driver.type() == AssetType.CAT:
                assert isinstance(wallet, CATWallet)
                assert isinstance(puzzle_driver, PuzzleInfo)
                if wallet.get_asset_id() == puzzle_driver.also().get("tail", None):
                    return wallet
        return None

    async def create_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")

        # Need to convert from our WalletType to the one in wallet_protocol.py
        if puzzle_driver.type() == AssetType.CAT:
            assert isinstance(puzzle_driver, PuzzleInfo)
            cat_tail = puzzle_driver.also().get("tail", None)
            if cat_tail is None:
                raise ValueError("Tail is required to create a CAT wallet")
            self.log.info(f"Creating CAT wallet for tail: {cat_tail.hex()}")
            wallet = await CATWallet.get_or_create_wallet_for_cat(
                self.wallet_state_manager, self.wallet_state_manager.main_wallet, cat_tail.hex(), name=name
            )
            return wallet.id()

        return uint32(0)

    async def create_did_wallet(
        self,
        amount: int,
        fee: int = 0,
        name: Optional[str] = None,
        backup_ids: Optional[List[str]] = None,
        required_num: Optional[int] = None,
    ) -> Tuple[uint32, List[str]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating DID wallet")
        if backup_ids is None:
            backup_ids = []
        if required_num is None:
            required_num = len(backup_ids)
        did_wallet: DIDWallet = await DIDWallet.create_new_did_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            uint64(amount),
            uint64(fee),
            name,
            [bytes32.from_hexstr(backup_id) for backup_id in backup_ids],
            uint64(required_num),
        )
        my_did_id = did_wallet.get_my_DID()
        assert my_did_id is not None
        return did_wallet.id(), [my_did_id.hex()]

    async def create_nft_wallet(self, did_id: Optional[str], name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info(f"Creating NFT wallet with DID {did_id}")
        did_id_bytes: Optional[bytes32] = None
        if did_id is not None:
            did_id_bytes = bytes32.from_hexstr(did_id)
        nft_wallet: NFTWallet = await NFTWallet.create_new_nft_wallet(
            self.wallet_state_manager, self.wallet_state_manager.main_wallet, did_id_bytes, name
        )
        return nft_wallet.id()

    async def create_pool_wallet(
        self,
        target_puzzlehash: bytes32,
        pool_url: Optional[str],
        relative_lock_height: uint32,
        backup_host: str,
        mode: str,
        state: str,
        fee: uint64,
        p2_singleton_delay_time: Optional[uint64] = None,
        p2_singleton_delayed_ph: Optional[bytes32] = None,
    ) -> Tuple[uint32, Optional[bytes32]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating pool wallet")
        pool_wallet = await PoolWallet.create_new_pool_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            target_puzzlehash,
            pool_url,
            relative_lock_height,
            backup_host,
            mode,
            state,
            fee,
            p2_singleton_delay_time,
            p2_singleton_delayed_ph,
        )
        return pool_wallet.id(), pool_wallet.launcher_id

    async def create_clawback_wallet(self, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating clawback wallet")
        clawback_wallet = await ClawbackWallet.create_new_clawback_wallet(
            self.wallet_state_manager, self.wallet_state_manager.main_wallet, name
        )
        return clawback_wallet.id()

    async def create_vc_wallet(self, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating VC wallet")
        vc_wallet = await VCWallet.create_new_vc_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            name,
        )
        return vc_wallet.id()

    async def create_data_layer_wallet(self, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating data layer wallet")
        dl_wallet = await DataLayerWallet.create_new_dl_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            name,
        )
        return dl_wallet.id()

    async def create_dao_wallet(
        self,
        amount_of_cats: uint64,
        amount_per_cat: uint64,
        treasury_id: Optional[bytes32] = None,
        filter_amount: uint64 = uint64(1),
        name: Optional[str] = None,
        fee: uint64 = uint64(0),
        fee_for_cat: uint64 = uint64(0),
    ) -> Tuple[uint32, bytes32]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating dao wallet")
        dao_wallet = await DAOWallet.create_new_dao_and_treasury(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            uint64(amount_of_cats),
            uint64(amount_per_cat),
            treasury_id,
            uint64(filter_amount),
            name,
            fee,
            fee_for_cat,
        )
        return dao_wallet.id(), dao_wallet.get_treasury_id()

    async def create_dao_cat_wallet(
        self,
        dao_id: bytes32,
        amount: uint64,
        treasury_id: Optional[bytes32] = None,
        name: Optional[str] = None,
        fee: uint64 = uint64(0),
    ) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating dao CAT wallet")
        dao_wallet = self.wallet_state_manager.get_wallet_for_asset_id(dao_id.hex())
        if dao_wallet is None:
            raise ValueError(f"Could not find DAO wallet for DAO ID: {dao_id.hex()}")
        if not isinstance(dao_wallet, DAOWallet):
            raise ValueError(f"Wallet for DAO ID: {dao_id.hex()} is not a DAO wallet")
        dao_cat_wallet = await dao_wallet.create_treasury_wallet(treasury_id, amount, name, fee)
        return dao_cat_wallet.id()

    async def create_watch_wallet(
        self,
        callback_transaction: Callable[[Dict[str, Any]], None],
        callback_coin_updates: Callable[[Dict[str, Any]], None],
        callback_pending_transaction: Callable[[Dict[str, Any]], None],
        name: Optional[str] = None,
    ) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating watch wallet")
        watch_wallet = await WatchWallet.create_new_watch_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            name,
            callback_transaction,
            callback_coin_updates,
            callback_pending_transaction,
        )
        return watch_wallet.id()

    async def get_cat_list(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if self.wallet_state_manager is None:
            return [], []
        return await self.wallet_state_manager.get_cat_list()

    async def get_stray_cats(self) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            return {}
        return await self.wallet_state_manager.interested_store.get_stray_cats()

    async def add_stray_cat(self, asset_id: bytes32, name: str) -> Optional[uint32]:
        if self.wallet_state_manager is None:
            return None
        wallet = await CATWallet.get_or_create_wallet_for_cat(
            self.wallet_state_manager, self.wallet_state_manager.main_wallet, asset_id.hex(), name
        )
        return wallet.id()

    async def get_spendable_coins(
        self, wallet_id: int, coin_selection_config: CoinSelectionConfig
    ) -> Tuple[List[CoinRecord], List[CoinRecord], List[Coin]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        return await wallet.get_spendable_coins(coin_selection_config)

    async def get_non_observer_wallet(self, wallet_id: uint32) -> Optional[WalletProtocol[Any]]:
        """Get wallet that is not an observer wallet"""
        if self.wallet_state_manager is None:
            return None
        wallet = self.wallet_state_manager.wallets[wallet_id]
        if wallet.type() == WalletType.WATCH:
            return None
        return wallet

    async def get_coin_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        coin_type: CoinType = CoinType.NORMAL,
        coin_ids: Optional[List[bytes32]] = None,
        include_total_count: bool = False,
        wallet_type: Optional[WalletType] = None,
        min_amount: Optional[uint64] = None,
        max_amount: Optional[uint64] = None,
        confirmed: Optional[bool] = None,
        spent: Optional[bool] = None,
    ) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_type is not None:
            wallet = await self.wallet_state_manager.get_wallet_by_type(wallet_type)
            if wallet is None:
                raise ValueError(f"No wallet found for type {wallet_type}")
            wallet_id = wallet.id()
        else:
            wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            assert isinstance(wallet, WatchWallet)
            return await wallet.get_coin_records(
                start,
                end,
                coin_type,
                coin_ids,
                include_total_count,
                min_amount,
                max_amount,
                confirmed,
                spent,
            )
        else:
            return await self.wallet_state_manager.coin_store.get_coin_records(
                start,
                end,
                wallet_id,
                coin_type,
                coin_ids,
                include_total_count,
                min_amount,
                max_amount,
                confirmed,
                spent,
            )

    async def get_transaction_count_for_wallet(
        self,
        wallet_id: int,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
    ) -> int:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if not await self.wallet_state_manager.synced():
            return 0
        count = await self.wallet_state_manager.tx_store.get_transaction_count_for_wallet(
            wallet_id, confirmed=confirmed, type=type_filter
        )
        return count

    async def get_transaction_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        sort_key: Optional[str] = None,
        reverse: bool = False,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
        include_total_count: bool = False,
        to_puzzle_hash: Optional[bytes32] = None,
    ) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        records, total_count = await self.wallet_state_manager.tx_store.get_transactions_between(
            wallet_id,
            start,
            end,
            sort_key=sort_key,
            reverse=reverse,
            confirmed=confirmed,
            type=type_filter,
            include_total_count=include_total_count,
            to_puzzle_hash=to_puzzle_hash,
        )
        return {"transactions": records, "total_count": total_count}

    async def get_transaction_memo(self, transaction_id: bytes32) -> Optional[Dict[bytes32, List[bytes]]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.tx_store.get_transaction_memo(transaction_id)

    async def get_transaction_count_for_wallet(
        self,
        wallet_id: int,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
    ) -> int:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if not await self.wallet_state_manager.synced():
            return 0
        count = await self.wallet_state_manager.tx_store.get_transaction_count_for_wallet(
            wallet_id, confirmed=confirmed, type=type_filter
        )
        return count

    async def get_transaction_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        sort_key: Optional[str] = None,
        reverse: bool = False,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
        include_total_count: bool = False,
        to_puzzle_hash: Optional[bytes32] = None,
    ) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        records, total_count = await self.wallet_state_manager.tx_store.get_transactions_between(
            wallet_id,
            start,
            end,
            sort_key=sort_key,
            reverse=reverse,
            confirmed=confirmed,
            type=type_filter,
            include_total_count=include_total_count,
            to_puzzle_hash=to_puzzle_hash,
        )
        return {"transactions": records, "total_count": total_count}

    async def get_transaction_memo(self, transaction_id: bytes32) -> Optional[Dict[bytes32, List[bytes]]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.tx_store.get_transaction_memo(transaction_id)

    async def get_transaction(self, transaction_id: bytes32) -> Optional[TransactionRecord]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.get_transaction(transaction_id)

    async def get_stake_farm_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        include_total_count: bool = False,
    ) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        records, total_count = await self.wallet_state_manager.tx_store.get_stake_farm_records(
            wallet_id,
            start,
            end,
            include_total_count=include_total_count,
        )
        return {"transactions": records, "total_count": total_count}

    async def get_stake_farm_count(
        self,
        wallet_id: int,
    ) -> int:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        count = await self.wallet_state_manager.tx_store.get_stake_farm_count(wallet_id)
        return count

    async def get_farmed_amount(self) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        tx_records: List[TransactionRecord] = await self.wallet_state_manager.tx_store.get_farming_rewards()
        amount = 0
        pool_reward_amount = 0
        farmer_reward_amount = 0
        fee_amount = 0
        last_height_farmed = 0
        for record in tx_records:
            if record.wallet_id not in self.wallet_state_manager.wallets:
                continue
            if record.type == TransactionType.COINBASE_REWARD:
                if self.wallet_state_manager.wallets[record.wallet_id].type() == WalletType.POOLING_WALLET:
                    # Don't add pool rewards for pool wallets.
                    continue
                pool_reward_amount += record.amount
            height = record.height_farmed(self.constants.GENESIS_CHALLENGE)
            if record.type == TransactionType.FEE_REWARD:
                fee_amount += record.amount - calculate_base_farmer_reward(height)
                farmer_reward_amount += calculate_base_farmer_reward(height)
            if height > last_height_farmed:
                last_height_farmed = height
            amount += record.amount

        assert amount == pool_reward_amount + farmer_reward_amount + fee_amount
        return {
            "amount": amount,
            "pool_reward_amount": pool_reward_amount,
            "farmer_reward_amount": farmer_reward_amount,
            "fee_amount": fee_amount,
            "last_height_farmed": last_height_farmed,
        }

    async def create_signed_transaction(
        self,
        additions: List[Dict[str, Any]],
        tx_config: TXConfig,
        fee: uint64 = uint64(0),
        coins: Optional[Set[Coin]] = None,
        coin_announcements: Optional[Set[Announcement]] = None,
        puzzle_announcements: Optional[Set[Announcement]] = None,
        wallet_id: Optional[int] = None,
        memos: Optional[List[List[bytes]]] = None,
        extra_conditions: Optional[List[Condition]] = None,
        **kwargs: Unpack[GSTOptionalArgs],
    ) -> TransactionRecord:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_id is None:
            wallet_id = self.wallet_state_manager.main_wallet.id()
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Watch wallets cannot create transactions")
        async with self.wallet_state_manager.lock:
            transaction = await wallet.generate_signed_transaction(
                amount=uint64(0),
                puzzle_hash=bytes32([0] * 32),
                tx_config=tx_config,
                fee=fee,
                coins=coins,
                primaries=additions,
                coin_announcements_to_consume=coin_announcements,
                puzzle_announcements_to_consume=puzzle_announcements,
                memos=memos,
                extra_conditions=extra_conditions,
                **kwargs,
            )
            return transaction

    async def create_signed_transactions(
        self,
        additions: List[Dict[str, Any]],
        tx_config: TXConfig,
        fee: uint64 = uint64(0),
        coins: Optional[Set[Coin]] = None,
        coin_announcements: Optional[Set[Announcement]] = None,
        puzzle_announcements: Optional[Set[Announcement]] = None,
        wallet_id: Optional[int] = None,
        memos: Optional[List[List[bytes]]] = None,
        extra_conditions: Optional[List[Condition]] = None,
        **kwargs: Unpack[GSTOptionalArgs],
    ) -> List[TransactionRecord]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_id is None:
            wallet_id = self.wallet_state_manager.main_wallet.id()
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Watch wallets cannot create transactions")
        async with self.wallet_state_manager.lock:
            transactions = await wallet.generate_signed_transactions(
                amount=uint64(0),
                puzzle_hash=bytes32([0] * 32),
                tx_config=tx_config,
                fee=fee,
                coins=coins,
                primaries=additions,
                coin_announcements_to_consume=coin_announcements,
                puzzle_announcements_to_consume=puzzle_announcements,
                memos=memos,
                extra_conditions=extra_conditions,
                **kwargs,
            )
            return transactions

    async def push_tx(self, spend_bundle: SpendBundle) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        try:
            wallet_state_manager = self.wallet_state_manager
            async with self.wallet_state_manager.lock:
                added = await wallet_state_manager.add_pending_transaction(
                    TransactionRecord.from_spend_bundle(
                        spend_bundle,
                        uint64(0),
                        uint32(0),
                        uint64(0),
                        None,
                        None,
                        uint32(0),
                        TransactionType.INCOMING_TX,
                    )
                )
                status = MempoolInclusionStatus.PENDING
                error = None
        except Exception as e:
            self.log.error(f"Failed to add transaction to pending pool: {e}")
            status = MempoolInclusionStatus.FAILED
            error = str(e)
            added = None
        return {"status": status.name, "error": error, "transaction": added}

    async def push_transactions(self, txs: List[TransactionRecord]) -> List[TransactionRecord]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")

        result: List[TransactionRecord] = []
        for tx in txs:
            try:
                wallet_state_manager = self.wallet_state_manager
                async with self.wallet_state_manager.lock:
                    await wallet_state_manager.add_pending_transaction(tx)
                    result.append(tx)
            except Exception as e:
                self.log.error(f"Failed to add transaction to pending pool: {e}")
        return result

    async def _get_cached_block_header(self, height: uint32) -> Optional[HeaderBlock]:
        if height in self.cached_blocks:
            return self.cached_blocks[height]
        return None

    async def _update_cached_block_header(self, height: uint32, block: HeaderBlock) -> None:
        self.cached_blocks[height] = block

    async def _get_header_block_by_height(
        self, height: uint32, peer: WSChiaConnection
    ) -> Optional[Tuple[bytes32, HeaderBlock]]:
        """
        Returns a header block by height. Returns None if not found.
        """
        cached_block = await self._get_cached_block_header(height)
        if cached_block is not None:
            return cached_block.header_hash, cached_block

        response = await peer.call_api(
            ProtocolMessageTypes.request_block_header, RequestBlockHeader(uint32(height), True)
        )
        if response is None or not isinstance(response, RespondBlockHeader):
            return None
        header_block = HeaderBlock.from_bytes(response.header_block)
        header_hash = header_block.header_hash
        await self._update_cached_block_header(height, header_block)
        return header_hash, header_block

    async def get_header_block_by_height(self, height: uint32, peer: WSChiaConnection) -> Optional[HeaderBlock]:
        """
        Returns a header block by height. Returns None if not found.
        """
        result = await self._get_header_block_by_height(height, peer)
        if result is None:
            return None
        return result[1]

    async def get_coin_state(
        self, coin_names: List[bytes32], peer: Optional[WSChiaConnection] = None, fork_height: Optional[uint32] = None
    ) -> List[CoinState]:
        if peer is None:
            peer = self.get_full_node_peer()
        if peer is None:
            raise ValueError("No peer connected")
        self.log.debug(f"Requesting coin state for {coin_names}")
        msg = wallet_protocol.RegisterForCoinUpdates(coin_names, uint32(0))
        coin_state: Optional[RespondToCoinUpdates] = await peer.call_api(
            ProtocolMessageTypes.register_interest_in_coin, msg
        )
        if coin_state is None or not isinstance(coin_state, wallet_protocol.RespondToCoinUpdates):
            return []

        if not self.is_trusted(peer):
            valid_list = []
            for coin in coin_state.coin_states:
                valid = await self.validate_received_state_from_peer(
                    coin, peer, self.get_full_node_peer(), fork_height
                )
                if valid:
                    valid_list.append(coin)
            return valid_list

        return coin_state.coin_states

    async def fetch_children(
        self, coin_name: bytes32, peer: Optional[WSChiaConnection] = None, fork_height: Optional[uint32] = None
    ) -> List[CoinState]:
        if peer is None:
            peer = self.get_full_node_peer()
        if peer is None:
            raise ValueError("No peer connected")
        msg = wallet_protocol.RegisterForCoinUpdates([coin_name], uint32(0))
        children: Optional[RespondToCoinUpdates] = await peer.call_api(
            ProtocolMessageTypes.register_interest_in_coin, msg
        )
        if children is None or not isinstance(children, wallet_protocol.RespondToCoinUpdates):
            return []

        if not self.is_trusted(peer):
            valid_list = []
            for coin in children.coin_states:
                valid = await self.validate_received_state_from_peer(
                    coin, peer, self.get_full_node_peer(), fork_height
                )
                if valid:
                    valid_list.append(coin)
            return valid_list

        return children.coin_states

    # For RPC only. You should use wallet_state_manager.add_pending_transaction for normal wallet business.
    async def send_transaction(
        self, wallet_id: uint32, transaction: TransactionRecord, *args, **kwargs
    ) -> TransactionRecord:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        # Throw if wallet_id does not exist, but don't validate here that the wallet_id refers to the right wallet
        if wallet_id not in self.wallet_state_manager.wallets:
            raise ValueError(f"Wallet id {wallet_id} does not exist")

        # Not adding to pending pool here, validation is done in the wallet state manager
        await self.wallet_state_manager.add_pending_transaction(transaction)
        return transaction

    async def get_transaction_status(self, transaction_id: bytes32) -> List[Tuple[str, MempoolInclusionStatus, Optional[str]]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        result = []
        tx = await self.wallet_state_manager.get_transaction(transaction_id)
        if tx is None:
            raise ValueError(f"Transaction {transaction_id.hex()} not found")
        if tx.spend_bundle is None:
            return [("", MempoolInclusionStatus.FAILED, "No spend bundle")]

        full_node_peer = self.get_full_node_peer()
        if full_node_peer is None:
            return [("", MempoolInclusionStatus.PENDING, None)]

        try:
            response = await full_node_peer.call_api(
                ProtocolMessageTypes.get_transaction_status, wallet_protocol.GetTransactionStatus(transaction_id)
            )
            if not isinstance(response, wallet_protocol.TransactionStatus):
                result.append(("", MempoolInclusionStatus.FAILED, "No response"))
                return result
            result.append((response.node_id.hex(), MempoolInclusionStatus(response.status), response.error))
        except Exception as e:
            result.append(("", MempoolInclusionStatus.FAILED, str(e)))

        return result

    async def get_transaction_count(
        self, wallet_id: int, confirmed: Optional[bool] = None, type_filter: Optional[TransactionTypeFilter] = None
    ) -> int:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        count = await self.wallet_state_manager.tx_store.get_transaction_count_for_wallet(
            wallet_id, confirmed=confirmed, type=type_filter
        )
        return count

    async def get_transactions(
        self,
        wallet_id: int,
        start: int,
        end: int,
        sort_key: Optional[str] = None,
        reverse: bool = False,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
        to_puzzle_hash: Optional[bytes32] = None,
    ) -> List[TransactionRecord]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        records = await self.wallet_state_manager.tx_store.get_transactions_between(
            wallet_id,
            start,
            end,
            sort_key=sort_key,
            reverse=reverse,
            confirmed=confirmed,
            type=type_filter,
            to_puzzle_hash=to_puzzle_hash,
        )
        return records

    async def get_transaction_count_for_wallet(
        self,
        wallet_id: int,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
    ) -> int:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        count = await self.wallet_state_manager.tx_store.get_transaction_count_for_wallet(
            wallet_id, confirmed=confirmed, type=type_filter
        )
        return count

    async def get_initial_freeze_period(self) -> int:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.get_initial_freeze_period()

    async def get_wallet_balance(self, wallet_id: int) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        balance = await wallet.get_confirmed_balance()
        unconfirmed_balance = await wallet.get_unconfirmed_balance()
        spendable_balance = await wallet.get_spendable_balance()
        pending_change = await wallet.get_pending_change_balance()
        max_send_amount = await wallet.get_max_send_amount()
        unspent_coin_count = await wallet.wallet_state_manager.coin_store.count_unspent_coins_for_wallet(wallet_id)
        pending_coin_removal_count = await wallet.wallet_state_manager.coin_store.count_pending_coin_removals_for_wallet(
            wallet_id
        )

        frozen_balance = 0
        if wallet.type() == WalletType.STANDARD_WALLET:
            frozen_balance = await wallet.get_frozen_amount()
        elif wallet.type() == WalletType.CAT:
            frozen_balance = await wallet.get_frozen_amount()

        wallet_balance = {
            "wallet_id": wallet_id,
            "confirmed_wallet_balance": balance,
            "unconfirmed_wallet_balance": unconfirmed_balance,
            "spendable_balance": spendable_balance,
            "pending_change": pending_change,
            "max_send_amount": max_send_amount,
            "unspent_coin_count": unspent_coin_count,
            "pending_coin_removal_count": pending_coin_removal_count,
            "frozen_balance": frozen_balance,
        }

        return wallet_balance

    async def get_wallet_balances(self, wallet_ids: Optional[List[int]] = None) -> Dict[str, Dict[str, Any]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_ids is None:
            wallet_ids = list(self.wallet_state_manager.wallets.keys())
        result: Dict[str, Dict[str, Any]] = {}
        for wallet_id in wallet_ids:
            result[str(wallet_id)] = await self.get_wallet_balance(wallet_id)
        return result

    async def get_wallet_initial_balance(self, wallet_id: int) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        balance = await wallet.get_confirmed_balance()
        unconfirmed_balance = await wallet.get_unconfirmed_balance()
        spendable_balance = await wallet.get_spendable_balance()
        pending_change = await wallet.get_pending_change_balance()
        max_send_amount = await wallet.get_max_send_amount()
        unspent_coin_count = await wallet.wallet_state_manager.coin_store.count_unspent_coins_for_wallet(wallet_id)
        pending_coin_removal_count = await wallet.wallet_state_manager.coin_store.count_pending_coin_removals_for_wallet(
            wallet_id
        )

        frozen_balance = 0
        if wallet.type() == WalletType.STANDARD_WALLET:
            frozen_balance = await wallet.get_frozen_amount()
        elif wallet.type() == WalletType.CAT:
            frozen_balance = await wallet.get_frozen_amount()

        wallet_balance = {
            "wallet_id": wallet_id,
            "confirmed_wallet_balance": balance,
            "unconfirmed_wallet_balance": unconfirmed_balance,
            "spendable_balance": spendable_balance,
            "pending_change": pending_change,
            "max_send_amount": max_send_amount,
            "unspent_coin_count": unspent_coin_count,
            "pending_coin_removal_count": pending_coin_removal_count,
            "frozen_balance": frozen_balance,
        }

        return wallet_balance

    async def get_transaction(self, transaction_id: bytes32) -> Optional[TransactionRecord]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        transaction = await self.wallet_state_manager.get_transaction(transaction_id)
        return transaction

    async def get_cat_name(self, wallet_id: int) -> str:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CAT:
            assert isinstance(wallet, CATWallet)
            return wallet.get_name()
        return ""

    async def get_staking_info(self, wallet_id: int) -> Dict[str, Any]:
        """
        Get staking information for a wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.STANDARD_WALLET:
            assert isinstance(wallet, Wallet)
            return await wallet.get_staking_info()
        return {}

    async def get_cat_asset_id(self, wallet_id: int) -> Optional[bytes32]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CAT:
            assert isinstance(wallet, CATWallet)
            return bytes32.from_hexstr(wallet.get_asset_id())
        return None

    async def get_nft_wallet_did(self, wallet_id: int) -> Optional[bytes32]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.NFT:
            assert isinstance(wallet, NFTWallet)
            return wallet.get_did()
        return None

    async def get_nft_wallet_nfts(
        self, wallet_id: int, start_index: int = 0, count: int = 50
    ) -> Dict[str, List[Dict[str, Any]]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.NFT:
            assert isinstance(wallet, NFTWallet)
            return await wallet.get_nfts(start_index, count)
        return {}

    async def get_nft_by_id(self, wallet_id: int, nft_id: bytes32) -> Optional[Dict[str, Any]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.NFT:
            assert isinstance(wallet, NFTWallet)
            return await wallet.get_nft_by_id(nft_id)
        return None

    async def get_wallets(self) -> Dict[str, Any]:
        """
        Return a list of wallets
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        result = []
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            wallet_type = wallet.type()
            data = {
                "id": wallet_id,
                "name": wallet.get_name(),
                "type": wallet_type,
                "meta": wallet.get_metadata(),
            }
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                data["asset_id"] = wallet.get_asset_id()
                data["asset_id_hex"] = wallet.get_asset_id()
            result.append(data)
        return {"wallets": result}

    async def get_wallet_for_asset_id(self, asset_id: str) -> Optional[WalletProtocol]:
        """
        Returns a wallet for a given asset id
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                if wallet.get_asset_id() == asset_id:
                    return wallet
            elif wallet.type() == WalletType.NFT:
                assert isinstance(wallet, NFTWallet)
                if wallet.get_launcher_id().hex() == asset_id:
                    return wallet
            elif wallet.type() == WalletType.DATA_LAYER:
                assert isinstance(wallet, DataLayerWallet)
                if wallet.get_launcher_id().hex() == asset_id:
                    return wallet
        return None

    async def get_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo) -> Optional[WalletProtocol]:
        """
        Returns a wallet for a given puzzle driver
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT and puzzle_driver.type() == AssetType.CAT:
                assert isinstance(wallet, CATWallet)
                assert isinstance(puzzle_driver, PuzzleInfo)
                if wallet.get_asset_id() == puzzle_driver.also().get("tail", None):
                    return wallet
        return None

    async def create_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo, name: Optional[str] = None) -> uint32:
        """
        Creates a wallet for a given puzzle driver
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        # Need to convert from our WalletType to the one in wallet_protocol.py
        if puzzle_driver.type() == AssetType.CAT:
            assert isinstance(puzzle_driver, PuzzleInfo)
            cat_tail = puzzle_driver.also().get("tail", None)
            if cat_tail is None:
                raise ValueError("Tail is required to create a CAT wallet")
            self.log.info(f"Creating CAT wallet for tail: {cat_tail.hex()}")
            wallet = await CATWallet.get_or_create_wallet_for_cat(
                self.wallet_state_manager, self.wallet_state_manager.main_wallet, cat_tail.hex(), name=name
            )
            return wallet.id()

        return uint32(0)

    async def get_spendable_coins(
        self, wallet_id: int, coin_selection_config: CoinSelectionConfig
    ) -> Tuple[List[CoinRecord], List[CoinRecord], List[Coin]]:
        """
        Returns a list of spendable coins, unconfirmed coins and coins that are not spendable.
        First list contains spendable coins, second list contains unconfirmed coins and third list contains unspendable coins.
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        return await wallet.get_spendable_coins(coin_selection_config)

    async def get_non_observer_wallet(self, wallet_id: uint32) -> Optional[WalletProtocol[Any]]:
        """Get wallet that is not an observer wallet"""
        if self.wallet_state_manager is None:
            return None
        wallet = self.wallet_state_manager.wallets[wallet_id]
        if wallet.type() == WalletType.WATCH:
            return None
        return wallet

    async def get_coin_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        coin_type: CoinType = CoinType.NORMAL,
        coin_ids: Optional[List[bytes32]] = None,
        include_total_count: bool = False,
        wallet_type: Optional[WalletType] = None,
        min_amount: Optional[uint64] = None,
        max_amount: Optional[uint64] = None,
        confirmed: Optional[bool] = None,
        spent: Optional[bool] = None,
    ) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_type is not None:
            wallet = await self.wallet_state_manager.get_wallet_by_type(wallet_type)
            if wallet is None:
                raise ValueError(f"No wallet found for type {wallet_type}")
            wallet_id = wallet.id()
        else:
            wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            assert isinstance(wallet, WatchWallet)
            return await wallet.get_coin_records(
                start,
                end,
                coin_type,
                coin_ids,
                include_total_count,
                min_amount,
                max_amount,
                confirmed,
                spent,
            )
        else:
            return await self.wallet_state_manager.coin_store.get_coin_records(
                start,
                end,
                wallet_id,
                coin_type,
                coin_ids,
                include_total_count,
                min_amount,
                max_amount,
                confirmed,
                spent,
            )

    async def get_wallets_by_ids(self, wallet_ids: Optional[List[int]] = None) -> Dict[str, Any]:
        """
        Returns a list of wallets
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_ids is None:
            wallet_ids = []
        result = []
        for wallet_id in wallet_ids:
            wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
            wallet_type = wallet.type()
            data = {
                "id": wallet_id,
                "name": wallet.get_name(),
                "type": wallet_type,
                "meta": wallet.get_metadata(),
            }
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                data["asset_id"] = wallet.get_asset_id()
                data["asset_id_hex"] = wallet.get_asset_id()
            result.append(data)
        return {"wallets": result}

    async def get_wallet_for_asset_id(self, asset_id: str) -> Optional[WalletProtocol]:
        """
        Returns a wallet for a given asset id
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                if wallet.get_asset_id() == asset_id:
                    return wallet
            elif wallet.type() == WalletType.NFT:
                assert isinstance(wallet, NFTWallet)
                if wallet.get_launcher_id().hex() == asset_id:
                    return wallet
            elif wallet.type() == WalletType.DATA_LAYER:
                assert isinstance(wallet, DataLayerWallet)
                if wallet.get_launcher_id().hex() == asset_id:
                    return wallet
        return None

    async def get_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo) -> Optional[WalletProtocol]:
        """
        Returns a wallet for a given puzzle driver
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT and puzzle_driver.type() == AssetType.CAT:
                assert isinstance(wallet, CATWallet)
                assert isinstance(puzzle_driver, PuzzleInfo)
                if wallet.get_asset_id() == puzzle_driver.also().get("tail", None):
                    return wallet
        return None

    async def create_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo, name: Optional[str] = None) -> uint32:
        """
        Creates a wallet for a given puzzle driver
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        # Need to convert from our WalletType to the one in wallet_protocol.py
        if puzzle_driver.type() == AssetType.CAT:
            assert isinstance(puzzle_driver, PuzzleInfo)
            cat_tail = puzzle_driver.also().get("tail", None)
            if cat_tail is None:
                raise ValueError("Tail is required to create a CAT wallet")
            self.log.info(f"Creating CAT wallet for tail: {cat_tail.hex()}")
            wallet = await CATWallet.get_or_create_wallet_for_cat(
                self.wallet_state_manager, self.wallet_state_manager.main_wallet, cat_tail.hex(), name=name
            )
            return wallet.id()

        return uint32(0)

    async def get_clawback_coins(
        self,
        wallet_id: int,
        min_amount: Optional[uint64] = None,
        max_amount: Optional[uint64] = None,
        metadata: Optional[Dict[str, str]] = None,
        include_total_count: bool = False,
        start: int = 0,
        end: int = 50,
        reverse: bool = False,
        clawback_coin_ids: Optional[List[bytes32]] = None,
    ) -> Dict[str, Any]:
        """
        Returns a list of clawback coins
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.get_clawback_coins(
                min_amount, max_amount, metadata, include_total_count, start, end, reverse, clawback_coin_ids
            )
        return {"coins": [], "total_count": 0}

    async def spend_clawback_coins(
        self,
        wallet_id: int,
        coin_ids: List[bytes32],
        fee: uint64 = uint64(0),
        tx_config: TXConfig = DEFAULT_TX_CONFIG,
    ) -> Dict[str, Any]:
        """
        Spends a list of clawback coins
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.spend_clawback_coins(coin_ids, fee, tx_config)
        return {}

    async def get_clawback_metadata(self, wallet_id: int, coin_id: bytes32) -> Dict[str, Any]:
        """
        Returns the metadata for a clawback coin
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.get_clawback_metadata(coin_id)
        return {}

    async def update_clawback_metadata(
        self, wallet_id: int, coin_id: bytes32, metadata: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Updates the metadata for a clawback coin
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.update_clawback_metadata(coin_id, metadata)
        return {}

    async def get_clawback_default_config(self, wallet_id: int) -> Dict[str, Any]:
        """
        Returns the default config for a clawback wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.get_default_config()
        return {}

    async def update_clawback_default_config(
        self, wallet_id: int, config: Dict[str, Any], persist: bool = True
    ) -> Dict[str, Any]:
        """
        Updates the default config for a clawback wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.update_default_config(config, persist)
        return {}

    async def get_auto_claim(self, wallet_id: int) -> Dict[str, Any]:
        """
        Returns the auto claim settings for a clawback wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.get_auto_claim()
        return {}

    async def update_auto_claim(
        self, wallet_id: int, auto_claim_settings: AutoClaimSettings, persist: bool = True
    ) -> Dict[str, Any]:
        """
        Updates the auto claim settings for a clawback wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.update_auto_claim(auto_claim_settings, persist)
        return {}

    async def process_clawback_auto_claim(self, wallet_id: int) -> Dict[str, Any]:
        """
        Processes the auto claim for a clawback wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.process_auto_claim()
        return {}

    async def get_transaction_memo(self, transaction_id: bytes32) -> Dict[str, Any]:
        """
        Returns the memo for a transaction
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        result = await self.wallet_state_manager.tx_store.get_transaction_memo(transaction_id)
        if result is None:
            return {}
        return {"memo": result}

    async def get_all_wallet_info_entries(self, fingerprint: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Returns a list of wallet info entries
        """
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        result = []
        for key, value in self.config["wallet"].items():
            if key == "network_overrides" or key == "settings":
                continue
            if fingerprint is not None and value.get("fingerprint", None) != fingerprint:
                continue
            result.append(value.copy())
        return result

    async def get_wallet_config(self, fingerprint: int) -> Dict[str, Any]:
        """
        Returns the config for a wallet
        """
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        config = {}
        for key, value in self.config["wallet"].items():
            if key == "network_overrides" or key == "settings":
                continue
            if value.get("fingerprint", None) == fingerprint:
                config = value.copy()
        return config

    async def get_wallet_info(self, fingerprint: int) -> Optional[Dict[str, Any]]:
        """
        Returns the wallet info for a fingerprint
        """
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        for key, value in self.config["wallet"].items():
            if key == "network_overrides" or key == "settings":
                continue
            if value.get("fingerprint", None) == fingerprint:
                return value.copy()
        return None

    async def get_private_key(self, fingerprint: int) -> Optional[PrivateKey]:
        """
        Returns the private key for a fingerprint
        """
        if self.keychain_proxy is None:
            await self.ensure_keychain_proxy()
        private_key = await self.keychain_proxy.get_key_for_fingerprint(fingerprint)
        return private_key

    async def get_sync_status(self) -> bool:
        """
        Returns the sync status of the wallet
        """
        if self.wallet_state_manager is None:
            return False
        synced = await self.wallet_state_manager.synced()
        return synced

    async def get_next_interesting_coin_ids(self, up_to_height: Optional[uint32] = None) -> List[bytes32]:
        """
        Returns the next interesting coin ids
        """
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.interested_store.get_next_coin_ids(up_to_height)
        return result

    async def get_timestamp_for_height(self, height: uint32) -> uint64:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        if height >= self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            return uint64(height)

        if self.wallet_state_manager is None:
            raise ValueError("The wallet service is not initialized")

        for i in range(height, -1, -1):
            if i == 0:
                return uint64(self.constants.GENESIS_CHALLENGE_INITIALIZED_TIMESTAMP)
            block = await self.wallet_state_manager.blockchain.get_header_block_record(uint32(i))
            if block is not None and block.is_transaction_block:
                return block.timestamp

        raise ValueError(f"No transaction block found for height {height}")

    async def get_height_for_timestamp(self, timestamp: uint64) -> uint32:
        """
        Returns the height of the first block with timestamp > timestamp
        and that has a timestamp
        """
        if timestamp < self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            blocks = await self.wallet_state_manager.blockchain.get_header_blocks_in_range(0, timestamp)
            for i in range(0, len(blocks)):
                if blocks[i].is_transaction_block and blocks[i].timestamp > timestamp:
                    return uint32(blocks[i].height)
            return uint32(0)
        else:
            return uint32(timestamp)

    async def get_synced_wallet_balances(self) -> Dict[str, Any]:
        """
        Returns the balances for all wallets if synced
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if await self.wallet_state_manager.synced() is False:
            return {"synced": False}
        return {"synced": True, "balances": await self.get_wallet_balances()}

    async def send_transaction(
        self, wallet_id: int, amount: uint64, address: str, fee: uint64 = uint64(0), memos: Optional[List[str]] = None
    ) -> TransactionRecord:
        """
        Sends a transaction
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Cannot send transactions from a watch wallet")
        if not isinstance(wallet, (Wallet, CATWallet)):
            raise ValueError("Wallet is not a standard wallet or CAT wallet")
        assert isinstance(wallet, (Wallet, CATWallet))
        tx = await wallet.generate_signed_transaction(
            amount,
            bytes32.from_hexstr(address),
            DEFAULT_TX_CONFIG,
            fee,
            memos=memos,
        )
        await wallet.push_transaction(tx)
        return tx

    async def send_transaction_multi(
        self, wallet_id: int, additions: List[Dict[str, Any]], fee: uint64 = uint64(0)
    ) -> TransactionRecord:
        """
        Sends a transaction with multiple additions
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Cannot send transactions from a watch wallet")
        if not isinstance(wallet, (Wallet, CATWallet)):
            raise ValueError("Wallet is not a standard wallet or CAT wallet")
        assert isinstance(wallet, (Wallet, CATWallet))
        # Validate additions
        for addition in additions:
            if "amount" not in addition or "puzzle_hash" not in addition:
                raise ValueError("Addition must contain both amount and puzzle_hash")
            if not isinstance(addition["amount"], int) or addition["amount"] < 0:
                raise ValueError("Amount must be a positive integer")
            if not isinstance(addition["puzzle_hash"], str) or len(addition["puzzle_hash"]) != 64:
                raise ValueError("Puzzle hash must be a 64 character hex string")

        # Convert additions
        additions_processed = []
        for addition in additions:
            additions_processed.append(
                {"amount": uint64(addition["amount"]), "puzzle_hash": bytes32.from_hexstr(addition["puzzle_hash"])}
            )

        tx = await wallet.generate_signed_transaction_multi(
            additions_processed,
            DEFAULT_TX_CONFIG,
            fee,
        )
        await wallet.push_transaction(tx)
        return tx

    async def delete_unconfirmed_transactions(self, wallet_id: int) -> None:
        """
        Deletes all unconfirmed transactions for a wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Cannot delete unconfirmed transactions from a watch wallet")
        await self.wallet_state_manager.tx_store.delete_unconfirmed_transactions(wallet_id)
        await wallet.wallet_state_manager.state_changed("pending_transaction", wallet.id())

    async def select_coins(
        self,
        wallet_id: int,
        amount: uint64,
        coin_selection_config: CoinSelectionConfig = DEFAULT_COIN_SELECTION_CONFIG,
    ) -> List[Dict[str, Any]]:
        """
        Selects coins for a transaction
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Cannot select coins from a watch wallet")
        if not isinstance(wallet, (Wallet, CATWallet)):
            raise ValueError("Wallet is not a standard wallet or CAT wallet")
        assert isinstance(wallet, (Wallet, CATWallet))
        selected_coins = await wallet.select_coins(amount, coin_selection_config)
        return [coin.to_json_dict() for coin in selected_coins]

    async def get_spendable_coins(
        self, wallet_id: int, coin_selection_config: CoinSelectionConfig
    ) -> Tuple[List[CoinRecord], List[CoinRecord], List[Coin]]:
        """
        Returns a list of spendable coins, unconfirmed coins and coins that are not spendable.
        First list contains spendable coins, second list contains unconfirmed coins and third list contains unspendable coins.
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        return await wallet.get_spendable_coins(coin_selection_config)

    async def get_coin_records_by_names(
        self, names: List[bytes32], include_spent_coins: bool = False
    ) -> List[CoinRecord]:
        """
        Returns a list of coin records by names
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.coin_store.get_coin_records_by_names(names, include_spent_coins)

    async def get_current_derivation_index(self) -> uint32:
        """
        Returns the current derivation index
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.puzzle_store.get_current_derivation_record_for_wallet()

    async def extend_derivation_index(self, index: uint32) -> None:
        """
        Extends the derivation index
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.puzzle_store.set_derivation_index(index)

    async def get_notifications(
        self, ids: Optional[List[bytes32]] = None, pagination: Optional[Tuple[Optional[int], Optional[int]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Returns a list of notifications
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        start = None
        end = None
        if pagination is not None:
            start, end = pagination
        notifs = await self.wallet_state_manager.notification_manager.notification_store.get_notifications(
            ids=ids, paginated=start is not None and end is not None, start=start, end=end
        )
        return [
            {"id": notif.coin_id.hex(), "message": notif.message.hex(), "amount": notif.amount}
            for notif in notifs
        ]

    async def delete_notifications(self, ids: Optional[List[bytes32]] = None) -> bool:
        """
        Deletes notifications
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.notification_manager.notification_store.delete_notifications(ids=ids)

    async def send_notification(
        self, target: bytes32, msg: bytes, amount: uint64, fee: uint64 = uint64(0)
    ) -> TransactionRecord:
        """
        Sends a notification
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        tx = await self.wallet_state_manager.notification_manager.send_new_notification(
            target, bytes(msg), amount, DEFAULT_TX_CONFIG, fee
        )
        return tx

    async def sign_message_by_address(self, address: str, message: str) -> Tuple[str, str, str]:
        """
        Signs a message by address
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        async with self.wallet_state_manager.puzzle_store.lock:
            private_key, public_key = await self.wallet_state_manager.get_keys(address)
        synthetic_secret_key = calculate_synthetic_secret_key(private_key, DEFAULT_HIDDEN_PUZZLE_HASH)
        synthetic_pk = synthetic_secret_key.get_g1()
        puzzle_hash = decode_puzzle_hash(address)
        pubkey_as_bytes = bytes(public_key)
        signature = AugSchemeMPL.sign(synthetic_secret_key, message.encode())
        return str(public_key), bytes(signature).hex(), pubkey_as_bytes.hex()

    async def sign_message_by_id(
        self, id: str, message: str, is_hex: bool = False
    ) -> Tuple[str, str, str, str]:
        """
        Signs a message by ID
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = await self.wallet_state_manager.get_wallet_for_fingerprint(int(id))
        if wallet is None:
            wallet = self.wallet_state_manager.get_wallet_for_asset_id(id.lower())
        if wallet is None:
            raise ValueError(f"Wallet for fingerprint/asset id: {id} not found")
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Cannot sign message from a watch wallet")
        if wallet.type() == WalletType.NFT:
            assert isinstance(wallet, NFTWallet)
            nft_id = bytes32.from_hexstr(id)
            nft_coin_info = await wallet.get_nft_by_id(nft_id)
            if nft_coin_info is None:
                raise ValueError(f"NFT for ID: {id} not found")
            puzzle_hash = nft_coin_info.nft_id
            pubkey, signature, pubkey_hex = await self.wallet_state_manager.main_wallet.sign_message(
                message, puzzle_hash, is_hex
            )
            return pubkey, signature, pubkey_hex, puzzle_hash.hex()
        else:
            puzzle_hash = None
            pubkey, signature, pubkey_hex = await wallet.sign_message(message, is_hex=is_hex)
            return pubkey, signature, pubkey_hex, ""

    async def verify_signature(
        self, message: str, pubkey: str, signature: str, address: Optional[str] = None
    ) -> bool:
        """
        Verifies a signature
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if address is not None:
            puzzle_hash = decode_puzzle_hash(address)
            pubkey_as_bytes = bytes.fromhex(pubkey)
            signature_as_bytes = bytes.fromhex(signature)
            return verify_message_signature(message, puzzle_hash, pubkey_as_bytes, signature_as_bytes)
        else:
            pubkey_as_bytes = bytes.fromhex(pubkey)
            signature_as_bytes = bytes.fromhex(signature)
            return AugSchemeMPL.verify(G1Element.from_bytes(pubkey_as_bytes), message.encode(), signature_as_bytes)

    async def get_transaction_count_for_wallet(
        self,
        wallet_id: int,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
    ) -> int:
        """
        Returns the number of transactions for a wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if not await self.wallet_state_manager.synced():
            return 0
        count = await self.wallet_state_manager.tx_store.get_transaction_count_for_wallet(
            wallet_id, confirmed=confirmed, type=type_filter
        )
        return count

    async def get_transaction_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        sort_key: Optional[str] = None,
        reverse: bool = False,
        confirmed: Optional[bool] = None,
        type_filter: Optional[TransactionTypeFilter] = None,
        include_total_count: bool = False,
        to_puzzle_hash: Optional[bytes32] = None,
    ) -> Dict[str, Any]:
        """
        Returns a list of transaction records
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        records, total_count = await self.wallet_state_manager.tx_store.get_transactions_between(
            wallet_id,
            start,
            end,
            sort_key=sort_key,
            reverse=reverse,
            confirmed=confirmed,
            type=type_filter,
            include_total_count=include_total_count,
            to_puzzle_hash=to_puzzle_hash,
        )
        return {"transactions": records, "total_count": total_count}

    async def get_transaction_memo(self, transaction_id: bytes32) -> Optional[Dict[bytes32, List[bytes]]]:
        """
        Returns the memo for a transaction
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.tx_store.get_transaction_memo(transaction_id)

    async def get_transaction(self, transaction_id: bytes32) -> Optional[TransactionRecord]:
        """
        Returns a transaction by ID
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        return await self.wallet_state_manager.get_transaction(transaction_id)

    async def get_stake_farm_records(
        self,
        wallet_id: int,
        start: int,
        end: int,
        include_total_count: bool = False,
    ) -> Dict[str, Any]:
        """
        Returns a list of stake farm records
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        records, total_count = await self.wallet_state_manager.tx_store.get_stake_farm_records(
            wallet_id,
            start,
            end,
            include_total_count=include_total_count,
        )
        return {"transactions": records, "total_count": total_count}

    async def get_stake_farm_count(
        self,
        wallet_id: int,
    ) -> int:
        """
        Returns the number of stake farm records
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        count = await self.wallet_state_manager.tx_store.get_stake_farm_count(wallet_id)
        return count

    async def get_farmed_amount(self) -> Dict[str, Any]:
        """
        Returns the farmed amount
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        tx_records: List[TransactionRecord] = await self.wallet_state_manager.tx_store.get_farming_rewards()
        amount = 0
        pool_reward_amount = 0
        farmer_reward_amount = 0
        fee_amount = 0
        last_height_farmed = 0
        for record in tx_records:
            if record.wallet_id not in self.wallet_state_manager.wallets:
                continue
            if record.type == TransactionType.COINBASE_REWARD:
                if self.wallet_state_manager.wallets[record.wallet_id].type() == WalletType.POOLING_WALLET:
                    # Don't add pool rewards for pool wallets.
                    continue
                pool_reward_amount += record.amount
            height = record.height_farmed(self.constants.GENESIS_CHALLENGE)
            if record.type == TransactionType.FEE_REWARD:
                fee_amount += record.amount - calculate_base_farmer_reward(height)
                farmer_reward_amount += calculate_base_farmer_reward(height)
            if height > last_height_farmed:
                last_height_farmed = height
            amount += record.amount

        assert amount == pool_reward_amount + farmer_reward_amount + fee_amount
        return {
            "amount": amount,
            "pool_reward_amount": pool_reward_amount,
            "farmer_reward_amount": farmer_reward_amount,
            "fee_amount": fee_amount,
            "last_height_farmed": last_height_farmed,
        }

    async def create_signed_transaction(
        self,
        additions: List[Dict[str, Any]],
        tx_config: TXConfig,
        fee: uint64 = uint64(0),
        coins: Optional[Set[Coin]] = None,
        coin_announcements: Optional[Set[Announcement]] = None,
        puzzle_announcements: Optional[Set[Announcement]] = None,
        wallet_id: Optional[int] = None,
        memos: Optional[List[List[bytes]]] = None,
        extra_conditions: Optional[List[Condition]] = None,
        **kwargs: Unpack[GSTOptionalArgs],
    ) -> TransactionRecord:
        """
        Creates a signed transaction
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_id is None:
            wallet_id = self.wallet_state_manager.main_wallet.id()
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Watch wallets cannot create transactions")
        async with self.wallet_state_manager.lock:
            transaction = await wallet.generate_signed_transaction(
                amount=uint64(0),
                puzzle_hash=bytes32([0] * 32),
                tx_config=tx_config,
                fee=fee,
                coins=coins,
                primaries=additions,
                coin_announcements_to_consume=coin_announcements,
                puzzle_announcements_to_consume=puzzle_announcements,
                memos=memos,
                extra_conditions=extra_conditions,
                **kwargs,
            )
            return transaction

    async def create_signed_transactions(
        self,
        additions: List[Dict[str, Any]],
        tx_config: TXConfig,
        fee: uint64 = uint64(0),
        coins: Optional[Set[Coin]] = None,
        coin_announcements: Optional[Set[Announcement]] = None,
        puzzle_announcements: Optional[Set[Announcement]] = None,
        wallet_id: Optional[int] = None,
        memos: Optional[List[List[bytes]]] = None,
        extra_conditions: Optional[List[Condition]] = None,
        **kwargs: Unpack[GSTOptionalArgs],
    ) -> List[TransactionRecord]:
        """
        Creates a list of signed transactions
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        if wallet_id is None:
            wallet_id = self.wallet_state_manager.main_wallet.id()
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.WATCH:
            raise ValueError("Watch wallets cannot create transactions")
        async with self.wallet_state_manager.lock:
            transactions = await wallet.generate_signed_transactions(
                amount=uint64(0),
                puzzle_hash=bytes32([0] * 32),
                tx_config=tx_config,
                fee=fee,
                coins=coins,
                primaries=additions,
                coin_announcements_to_consume=coin_announcements,
                puzzle_announcements_to_consume=puzzle_announcements,
                memos=memos,
                extra_conditions=extra_conditions,
                **kwargs,
            )
            return transactions

    async def push_tx(self, spend_bundle: SpendBundle) -> Dict[str, Any]:
        """
        Pushes a transaction to the mempool
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        try:
            wallet_state_manager = self.wallet_state_manager
            async with self.wallet_state_manager.lock:
                added = await wallet_state_manager.add_pending_transaction(
                    TransactionRecord.from_spend_bundle(
                        spend_bundle,
                        uint64(0),
                        uint32(0),
                        uint64(0),
                        None,
                        None,
                        uint32(0),
                        TransactionType.INCOMING_TX,
                    )
                )
                status = MempoolInclusionStatus.PENDING
                error = None
        except Exception as e:
            self.log.error(f"Failed to add transaction to pending pool: {e}")
            status = MempoolInclusionStatus.FAILED
            error = str(e)
            added = None
        return {"status": status.name, "error": error, "transaction": added}

    async def push_transactions(self, txs: List[TransactionRecord]) -> List[TransactionRecord]:
        """
        Pushes a list of transactions to the mempool
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")

        result: List[TransactionRecord] = []
        for tx in txs:
            try:
                wallet_state_manager = self.wallet_state_manager
                async with self.wallet_state_manager.lock:
                    await wallet_state_manager.add_pending_transaction(tx)
                    result.append(tx)
            except Exception as e:
                self.log.error(f"Failed to add transaction to pending pool: {e}")
        return result

    async def _get_cached_block_header(self, height: uint32) -> Optional[HeaderBlock]:
        if height in self.cached_blocks:
            return self.cached_blocks[height]
        return None

    async def _update_cached_block_header(self, height: uint32, block: HeaderBlock) -> None:
        self.cached_blocks[height] = block

    async def _get_header_block_by_height(
        self, height: uint32, peer: WSChiaConnection
    ) -> Optional[Tuple[bytes32, HeaderBlock]]:
        """
        Returns a header block by height. Returns None if not found.
        """
        cached_block = await self._get_cached_block_header(height)
        if cached_block is not None:
            return cached_block.header_hash, cached_block

        response = await peer.call_api(
            ProtocolMessageTypes.request_block_header, RequestBlockHeader(uint32(height), True)
        )
        if response is None or not isinstance(response, RespondBlockHeader):
            return None
        header_block = HeaderBlock.from_bytes(response.header_block)
        header_hash = header_block.header_hash
        await self._update_cached_block_header(height, header_block)
        return header_hash, header_block

    async def get_header_block_by_height(self, height: uint32, peer: WSChiaConnection) -> Optional[HeaderBlock]:
        """
        Returns a header block by height. Returns None if not found.
        """
        result = await self._get_header_block_by_height(height, peer)
        if result is None:
            return None
        return result[1]

    async def get_coin_state(
        self, coin_names: List[bytes32], peer: Optional[WSChiaConnection] = None, fork_height: Optional[uint32] = None
    ) -> List[CoinState]:
        """
        Returns a list of coin states for a list of coin names
        """
        if peer is None:
            peer = self.get_full_node_peer()
        if peer is None:
            raise ValueError("No peer connected")
        self.log.debug(f"Requesting coin state for {coin_names}")
        msg = wallet_protocol.RegisterForCoinUpdates(coin_names, uint32(0))
        coin_state: Optional[RespondToCoinUpdates] = await peer.call_api(
            ProtocolMessageTypes.register_interest_in_coin, msg
        )
        if coin_state is None or not isinstance(coin_state, wallet_protocol.RespondToCoinUpdates):
            return []

        if not self.is_trusted(peer):
            valid_list = []
            for coin in coin_state.coin_states:
                valid = await self.validate_received_state_from_peer(
                    coin, peer, self.get_full_node_peer(), fork_height
                )
                if valid:
                    valid_list.append(coin)
            return valid_list

        return coin_state.coin_states

    async def fetch_children(
        self, coin_name: bytes32, peer: Optional[WSChiaConnection] = None, fork_height: Optional[uint32] = None
    ) -> List[CoinState]:
        """
        Returns a list of coin states for children of a coin
        """
        if peer is None:
            peer = self.get_full_node_peer()
        if peer is None:
            raise ValueError("No peer connected")
        msg = wallet_protocol.RegisterForCoinUpdates([coin_name], uint32(0))
        children: Optional[RespondToCoinUpdates] = await peer.call_api(
            ProtocolMessageTypes.register_interest_in_coin, msg
        )
        if children is None or not isinstance(children, wallet_protocol.RespondToCoinUpdates):
            return []

        if not self.is_trusted(peer):
            valid_list = []
            for coin in children.coin_states:
                valid = await self.validate_received_state_from_peer(
                    coin, peer, self.get_full_node_peer(), fork_height
                )
                if valid:
                    valid_list.append(coin)
            return valid_list

        return children.coin_states

    async def get_timestamp_for_height_from_peer(
        self, height: uint32, peer: WSChiaConnection
    ) -> Optional[uint64]:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        for i in range(height, -1, -1):
            if i == 0:
                return uint64(self.constants.GENESIS_CHALLENGE_INITIALIZED_TIMESTAMP)
            request = RequestBlockHeader(uint32(i))
            response: Optional[RespondBlockHeader] = await peer.call_api(
                ProtocolMessageTypes.request_block_header, request
            )
            if response is None:
                return None
            header_block = HeaderBlock.from_bytes(response.header_block)
            if header_block.is_transaction_block:
                return header_block.foliage_transaction_block.timestamp
        return None

    async def get_timestamp_for_height_from_peers(self, height: uint32) -> Optional[uint64]:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        if height >= self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            return uint64(height)

        full_node_peer = self.get_full_node_peer()
        if full_node_peer is None:
            self.log.warning("Cannot fetch timestamp, no peers")
            return None
        timestamp = await self.get_timestamp_for_height_from_peer(height, full_node_peer)
        if timestamp is None:
            self.log.warning(f"Timestamp lookup failed for height {height}")
            return None
        return timestamp

    async def new_peak(self, request: wallet_protocol.NewPeak) -> None:
        """
        Called when a new peak is received from the full node
        """
        if self._new_peak_queue is None:
            self.log.warning("New peak queue is None, ignoring new peak")
            return
        if self.wallet_state_manager is None:
            self.log.warning("Wallet state manager is None, ignoring new peak")
            return
        if await self.wallet_state_manager.synced() is False:
            self.log.warning("Wallet not synced, ignoring new peak")
            return

        peak_item = NewPeakItem(
            request.header_hash,
            request.height,
            request.weight,
            request.fork_point_with_previous_peak,
            request.height,
            [],
            [],
        )
        self._new_peak_queue.put(peak_item)

    async def add_interested_puzzle_hashes(
        self, puzzle_hashes: List[bytes32], wallet_ids: List[int], from_height: uint32 = uint32(0)
    ) -> None:
        """
        Add puzzle hashes to the interested puzzle hashes list
        """
        if self.wallet_state_manager is None:
            return
        for puzzle_hash, wallet_id in zip(puzzle_hashes, wallet_ids):
            await self.wallet_state_manager.add_interested_puzzle_hash(puzzle_hash, wallet_id, from_height)
        if len(puzzle_hashes) > 0:
            await self.wallet_state_manager.add_interested_puzzle_hashes()

    async def add_interested_coin_ids(self, coin_ids: List[bytes32], from_height: uint32 = uint32(0)) -> None:
        """
        Add coin IDs to the interested coin IDs list
        """
        if self.wallet_state_manager is None:
            return
        for coin_id in coin_ids:
            await self.wallet_state_manager.add_interested_coin_id(coin_id, from_height)
        if len(coin_ids) > 0:
            await self.wallet_state_manager.add_interested_coin_ids()

    async def process_state_changes(
        self,
        state_changes: List[CoinState],
        peer: WSChiaConnection,
        fork_height: Optional[uint32] = None,
    ) -> None:
        """
        Process state changes from the full node
        """
        if self.wallet_state_manager is None:
            return
        async with self._segment_validation_lock:
            await self.wallet_state_manager.add_coin_states(state_changes, peer.peer_node_id, fork_height)

    async def get_initial_confirmed_height(self) -> int:
        """
        Get the initial confirmed height
        """
        if self.wallet_state_manager is None:
            return -1
        return await self.wallet_state_manager.blockchain.get_finished_sync_up_to()

    async def get_confirmed_height(self) -> int:
        """
        Get the confirmed height
        """
        if self.wallet_state_manager is None:
            return -1
        return await self.wallet_state_manager.blockchain.get_finished_sync_up_to()

    async def get_peak(self) -> Optional[HeaderBlock]:
        """
        Get the peak block
        """
        if self.wallet_state_manager is None:
            return None
        peak = self.wallet_state_manager.blockchain.get_peak()
        if peak is None:
            return None
        block = await self.wallet_state_manager.blockchain.get_header_block(peak)
        return block

    async def get_peak_height(self) -> Optional[uint32]:
        """
        Get the peak height
        """
        if self.wallet_state_manager is None:
            return None
        peak = self.wallet_state_manager.blockchain.get_peak()
        if peak is None:
            return None
        return peak.height

    async def get_latest_singleton_coin_from_peer(
        self,
        peer: WSChiaConnection,
        launcher_id: bytes32,
        only_confirmed: bool = False,
    ) -> Optional[Coin]:
        """Get the latest singleton from a peer for the launcher ID"""
        if self.wallet_state_manager is None:
            return None

        coin_state_list: List[CoinState] = await subscribe_to_coin_updates(
            [launcher_id], peer, uint32(0), self.log, None
        )
        if coin_state_list is None:
            self.log.warning(f"Cannot find singleton {launcher_id.hex()} in the blockchain")
            return None

        launcher_coin_state: Optional[CoinState] = None
        for coin_state in coin_state_list:
            if coin_state.coin.name() == launcher_id:
                launcher_coin_state = coin_state
                break
        if launcher_coin_state is None:
            self.log.warning(f"Cannot find launcher {launcher_id.hex()} in the blockchain")
            return None

        coin_states = await request_and_validate_additions(
            peer, self.wallet_state_manager.blockchain, [launcher_coin_state.coin.name()], self.log
        )
        if coin_states is None:
            self.log.warning(f"Cannot find launcher {launcher_id.hex()} in the blockchain")
            return None

        for coin_state in coin_states:
            if coin_state.coin.parent_coin_info == launcher_id:
                return coin_state.coin

        self.log.warning(f"Cannot find child of launcher {launcher_id.hex()} in the blockchain")
        return None

    async def get_next_interesting_coin_ids(self, up_to_height: Optional[uint32] = None) -> List[bytes32]:
        """
        Get the next interesting coin IDs
        """
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.interested_store.get_next_coin_ids(up_to_height)
        return result

    async def get_cactus_connection(self) -> Optional[WSChiaConnection]:
        """
        Get a connection to a Cactus full node
        """
        if self.server is None:
            return None
        connections = self.server.get_connections(NodeType.FULL_NODE)
        if len(connections) == 0:
            return None
        return connections[0]

    async def get_all_transactions(self, wallet_id: int) -> List[TransactionRecord]:
        """
        Get all transactions for a wallet
        """
        if self.wallet_state_manager is None:
            return []
        return await self.wallet_state_manager.tx_store.get_all_transactions_for_wallet(wallet_id)

    async def get_transaction(self, wallet_id: int, transaction_id: bytes32) -> Optional[TransactionRecord]:
        """
        Get a transaction by ID
        """
        if self.wallet_state_manager is None:
            return None
        return await self.wallet_state_manager.tx_store.get_transaction_record(transaction_id)

    async def get_transaction_by_coin_id(self, coin_id: bytes32) -> Optional[TransactionRecord]:
        """
        Get a transaction by coin ID
        """
        if self.wallet_state_manager is None:
            return None
        return await self.wallet_state_manager.tx_store.get_transaction_record_by_coin_id(coin_id)

    async def get_transaction_by_coin_ids(self, coin_ids: List[bytes32]) -> List[TransactionRecord]:
        """
        Get a list of transactions by coin IDs
        """
        if self.wallet_state_manager is None:
            return []
        return await self.wallet_state_manager.tx_store.get_transaction_records_by_coin_id(coin_ids)

    async def get_coin_records_by_coin_ids(self, coin_ids: List[bytes32]) -> List[WalletCoinRecord]:
        """
        Get a list of coin records by coin IDs
        """
        if self.wallet_state_manager is None:
            return []
        return await self.wallet_state_manager.coin_store.get_coin_records_by_coin_ids(coin_ids)

    async def get_spendable_coins_for_wallet(
        self, wallet_id: int, records: Optional[Set[WalletCoinRecord]] = None
    ) -> Set[WalletCoinRecord]:
        """
        Get spendable coins for a wallet
        """
        if self.wallet_state_manager is None:
            return set()
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if records is None:
            records = await self.wallet_state_manager.coin_store.get_spendable_coins_for_wallet(wallet_id)
        # Ensure we return only owned coins
        return await wallet.get_confirmed_spendable_coins_for_wallet(records)

    async def get_all_coin_records_for_wallet(self, wallet_id: int) -> Set[WalletCoinRecord]:
        """
        Get all coin records for a wallet
        """
        if self.wallet_state_manager is None:
            return set()
        result = await self.wallet_state_manager.coin_store.get_all_coin_records_for_wallet(wallet_id)
        return set(result)

    async def get_coin_records_by_puzzle_hash(self, puzzle_hash: bytes32) -> List[WalletCoinRecord]:
        """
        Get coin records by puzzle hash
        """
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.coin_store.get_coin_records_by_puzzle_hash(puzzle_hash)
        return result

    async def get_coin_records_by_puzzle_hashes(self, puzzle_hashes: List[bytes32]) -> List[WalletCoinRecord]:
        """
        Get coin records by puzzle hashes
        """
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.coin_store.get_coin_records_by_puzzle_hashes(puzzle_hashes)
        return result

    async def get_coin_records_by_parent_ids(self, parent_ids: List[bytes32]) -> List[WalletCoinRecord]:
        """
        Get coin records by parent IDs
        """
        if self.wallet_state_manager is None:
            return []
        result = await self.wallet_state_manager.coin_store.get_coin_records_by_parent_ids(parent_ids)
        return result

    async def get_additions_for_block(self, block_path: Path) -> Optional[List[Coin]]:
        """
        Get additions for a block
        """
        if self.wallet_state_manager is None:
            return None
        try:
            with open(block_path, "r") as f:
                block_json = json.load(f)
        except Exception as e:
            self.log.warning(f"Could not load block {block_path}: {e}")
            return None
        try:
            header_hash = bytes32.from_hexstr(block_json["header_hash"])
            additions: List[Coin] = []
            for coin_json in block_json["additions"]:
                coin = Coin.from_json_dict(coin_json)
                additions.append(coin)
            return additions
        except Exception as e:
            self.log.warning(f"Could not get additions from block {block_path}: {e}")
            return None

    async def get_removals_for_block(self, block_path: Path) -> Optional[List[bytes32]]:
        """
        Get removals for a block
        """
        if self.wallet_state_manager is None:
            return None
        try:
            with open(block_path, "r") as f:
                block_json = json.load(f)
        except Exception as e:
            self.log.warning(f"Could not load block {block_path}: {e}")
            return None
        try:
            header_hash = bytes32.from_hexstr(block_json["header_hash"])
            removals: List[bytes32] = []
            for coin_json in block_json["removals"]:
                coin_name = bytes32.from_hexstr(coin_json)
                removals.append(coin_name)
            return removals
        except Exception as e:
            self.log.warning(f"Could not get removals from block {block_path}: {e}")
            return None

    async def reorg_rollback(self, height: int) -> List[uint32]:
        """
        Rolls back the wallet to a given height
        """
        if self.wallet_state_manager is None:
            return []
        header_hash = await self.wallet_state_manager.blockchain.height_to_hash(uint32(height))
        return await self.wallet_state_manager.reorg_rollback(header_hash)

    async def _await_closed(self, shutting_down: bool = True) -> None:
        if self.server is not None:
            await self.server.close_all()
        if self.wallet_state_manager is not None:
            await self.wallet_state_manager.close()
            self.wallet_state_manager = None
        if shutting_down and self.keychain_proxy is not None:
            proxy = self.keychain_proxy
            self.keychain_proxy = None
            await proxy.close()
            await asyncio.sleep(0.5)  # https://github.com/python/cpython/issues/84609

    def _close(self) -> None:
        self._shut_down = True
        self.log.info("Wallet Node shutdown requested")

        if self._new_peak_queue is not None:
            self._new_peak_queue.stop()

        if self.wallet_state_manager is not None:
            self.wallet_state_manager.set_sync_mode(False)

        for task in self._wallet_tasks:
            task.cancel()
        if self._process_new_subscriptions_task is not None:
            self._process_new_subscriptions_task.cancel()
        if self._retry_failed_transactions_task is not None:
            self._retry_failed_transactions_task.cancel()
        for task in self._secondary_peer_tasks.values():
            task.cancel()

    def _prepare_full_node_peers(self) -> None:
        if self.wallet_peers is None:
            self.initialize_wallet_peers()

    async def start_network(self) -> None:
        if self.server is None:
            await self.start_server()

        self._prepare_full_node_peers()

        assert self.wallet_peers is not None
        asyncio.create_task(self.wallet_peers.start())

    async def start_server(self) -> bool:
        if self.wallet_node_api is None:
            self.wallet_node_api = WalletNodeAPI(self)
        if self.server is not None:
            return True

        self.server = await ChiaServer.create(
            self.config["port"],
            self.config,
            self.root_path,
            self.wallet_node_api,
            self.node_id,
            None,
            (self.log, self.log),
            self.get_wallet_peers_paths(),
            self.get_trusted_peer_ids(),
            introducer_peers=None,
            node_type=NodeType.WALLET,
            peer_api=None,
            peer_server_close_callback=self._on_disconnect,
        )

        self.wallet_node_api.full_node_peer_list = self.server.get_full_node_peer_list
        self.wallet_node_api.full_node_peers_info = self.server.get_full_node_peers_info
        self.wallet_node_api.set_server(self.server)
        return True

    async def ensure_is_closed(self) -> None:
        if self.is_closed():
            return
        self._close()
        await self._await_closed()

    def is_closed(self) -> bool:
        return self._shut_down

    async def stop(self) -> None:
        if self.is_closed():
            return
        self._close()
        await self._await_closed()

    async def get_connections(self, request_node_type: Optional[NodeType] = None) -> List[Dict[str, Any]]:
        if self.server is None:
            return []
        if request_node_type is None:
            request_node_type = NodeType.FULL_NODE
        connections = self.server.get_connections(request_node_type)
        con_info: List[Dict[str, Any]] = []
        if len(connections) == 0:
            return []
        for con in connections:
            con_dict: Dict[str, Any] = {
                "type": con.connection_type,
                "local_port": con.local_port,
                "peer_host": con.peer_info.host,
                "peer_port": con.peer_info.port,
                "peer_server_port": con.peer_server_port,
                "node_id": con.peer_node_id,
                "creation_time": con.creation_time,
                "bytes_read": con.bytes_read,
                "bytes_written": con.bytes_written,
                "last_message_time": con.last_message_time,
            }
            con_info.append(con_dict)
        return con_info

    async def create_account(self, account_human_name: str) -> Optional[uint32]:
        if self.wallet_state_manager is None:
            return None
        self.log.info(f"Creating wallet account: {account_human_name}")
        await self.wallet_state_manager.add_new_wallet(None, WalletType.STANDARD_WALLET, {}, account_human_name)
        return self.wallet_state_manager.main_wallet.id()

    async def get_accounts(self) -> List[str]:
        if self.wallet_state_manager is None:
            return []
        accounts = await self.wallet_state_manager.user_store.get_all_user_info()
        return [account.name for account in accounts]

    async def get_wallet_for_colour(self, colour: str) -> Optional[WalletProtocol]:
        if self.wallet_state_manager is None:
            return None
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                if wallet.get_asset_id().hex() == colour:
                    return wallet
        return None

    async def get_wallet_for_asset_id(self, asset_id: str) -> Optional[WalletProtocol]:
        if self.wallet_state_manager is None:
            return None
        for _, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT:
                assert isinstance(wallet, CATWallet)
                if wallet.get_asset_id().hex() == asset_id:
                    return wallet
            elif wallet.type() == WalletType.NFT:
                assert isinstance(wallet, NFTWallet)
                if bytes32.from_hexstr(asset_id) == wallet.get_launcher_id():
                    return wallet
            elif wallet.type() == WalletType.DATA_LAYER:
                assert isinstance(wallet, DataLayerWallet)
                if bytes32.from_hexstr(asset_id) == wallet.get_launcher_id():
                    return wallet
        return None

    async def get_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo) -> Optional[WalletProtocol]:
        if self.wallet_state_manager is None:
            return None
        for wallet_id, wallet in self.wallet_state_manager.wallets.items():
            if wallet.type() == WalletType.CAT and puzzle_driver.type() == AssetType.CAT:
                assert isinstance(wallet, CATWallet)
                assert isinstance(puzzle_driver, PuzzleInfo)
                if wallet.get_asset_id() == puzzle_driver.also().get("tail", None):
                    return wallet
        return None

    async def create_wallet_for_puzzle_info(self, puzzle_driver: PuzzleInfo, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")

        # Need to convert from our WalletType to the one in wallet_protocol.py
        if puzzle_driver.type() == AssetType.CAT:
            assert isinstance(puzzle_driver, PuzzleInfo)
            cat_tail = puzzle_driver.also().get("tail", None)
            if cat_tail is None:
                raise ValueError("Tail is required to create a CAT wallet")
            self.log.info(f"Creating CAT wallet for tail: {cat_tail.hex()}")
            wallet = await CATWallet.get_or_create_wallet_for_cat(
                self.wallet_state_manager, self.wallet_state_manager.main_wallet, cat_tail.hex(), name=name
            )
            return wallet.id()

        return uint32(0)

    async def create_did_wallet(
        self,
        amount: int,
        fee: int = 0,
        name: Optional[str] = None,
        backup_ids: Optional[List[str]] = None,
        required_num: Optional[int] = None,
    ) -> Tuple[uint32, List[str]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating DID wallet")
        if backup_ids is None:
            backup_ids = []
        if required_num is None:
            required_num = len(backup_ids)
        did_wallet: DIDWallet = await DIDWallet.create_new_did_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            uint64(amount),
            uint64(fee),
            name,
            [bytes32.from_hexstr(backup_id) for backup_id in backup_ids],
            uint64(required_num),
        )
        my_did_id = did_wallet.get_my_DID()
        assert my_did_id is not None
        return did_wallet.id(), [my_did_id.hex()]

    async def create_nft_wallet(self, did_id: Optional[str], name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info(f"Creating NFT wallet with DID {did_id}")
        did_id_bytes: Optional[bytes32] = None
        if did_id is not None:
            did_id_bytes = bytes32.from_hexstr(did_id)
        nft_wallet: NFTWallet = await NFTWallet.create_new_nft_wallet(
            self.wallet_state_manager, self.wallet_state_manager.main_wallet, did_id_bytes, name
        )
        return nft_wallet.id()

    async def create_pool_wallet(
        self,
        target_puzzlehash: bytes32,
        pool_url: Optional[str],
        relative_lock_height: uint32,
        backup_host: str,
        mode: str,
        state: str,
        fee: uint64,
        p2_singleton_delay_time: Optional[uint64] = None,
        p2_singleton_delayed_ph: Optional[bytes32] = None,
    ) -> Tuple[uint32, Optional[bytes32]]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating pool wallet")
        pool_wallet = await PoolWallet.create_new_pool_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            target_puzzlehash,
            pool_url,
            relative_lock_height,
            backup_host,
            mode,
            state,
            fee,
            p2_singleton_delay_time,
            p2_singleton_delayed_ph,
        )
        return pool_wallet.id(), pool_wallet.launcher_id

    async def create_clawback_wallet(self, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating clawback wallet")
        clawback_wallet = await ClawbackWallet.create_new_clawback_wallet(
            self.wallet_state_manager, self.wallet_state_manager.main_wallet, name
        )
        return clawback_wallet.id()

    async def create_vc_wallet(self, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating VC wallet")
        vc_wallet = await VCWallet.create_new_vc_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            name,
        )
        return vc_wallet.id()

    async def create_data_layer_wallet(self, name: Optional[str] = None) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating data layer wallet")
        dl_wallet = await DataLayerWallet.create_new_dl_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            name,
        )
        return dl_wallet.id()

    async def create_dao_wallet(
        self,
        amount_of_cats: uint64,
        amount_per_cat: uint64,
        treasury_id: Optional[bytes32] = None,
        filter_amount: uint64 = uint64(1),
        name: Optional[str] = None,
        fee: uint64 = uint64(0),
        fee_for_cat: uint64 = uint64(0),
    ) -> Tuple[uint32, bytes32]:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating dao wallet")
        dao_wallet = await DAOWallet.create_new_dao_and_treasury(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            uint64(amount_of_cats),
            uint64(amount_per_cat),
            treasury_id,
            uint64(filter_amount),
            name,
            fee,
            fee_for_cat,
        )
        return dao_wallet.id(), dao_wallet.get_treasury_id()

    async def create_dao_cat_wallet(
        self,
        dao_id: bytes32,
        amount: uint64,
        treasury_id: Optional[bytes32] = None,
        name: Optional[str] = None,
        fee: uint64 = uint64(0),
    ) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating dao CAT wallet")
        dao_wallet = self.wallet_state_manager.get_wallet_for_asset_id(dao_id.hex())
        if dao_wallet is None:
            raise ValueError(f"Could not find DAO wallet for DAO ID: {dao_id.hex()}")
        if not isinstance(dao_wallet, DAOWallet):
            raise ValueError(f"Wallet for DAO ID: {dao_id.hex()} is not a DAO wallet")
        dao_cat_wallet = await dao_wallet.create_treasury_wallet(treasury_id, amount, name, fee)
        return dao_cat_wallet.id()

    async def create_watch_wallet(
        self,
        callback_transaction: Callable[[Dict[str, Any]], None],
        callback_coin_updates: Callable[[Dict[str, Any]], None],
        callback_pending_transaction: Callable[[Dict[str, Any]], None],
        name: Optional[str] = None,
    ) -> uint32:
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        self.log.info("Creating watch wallet")
        watch_wallet = await WatchWallet.create_new_watch_wallet(
            self.wallet_state_manager,
            self.wallet_state_manager.main_wallet,
            name,
            callback_transaction,
            callback_coin_updates,
            callback_pending_transaction,
        )
        return watch_wallet.id()

    async def get_cat_list(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if self.wallet_state_manager is None:
            return [], []
        return await self.wallet_state_manager.get_cat_list()

    async def get_stray_cats(self) -> Dict[str, Any]:
        if self.wallet_state_manager is None:
            return {}
        return await self.wallet_state_manager.interested_store.get_stray_cats()

    async def add_stray_cat(self, asset_id: bytes32, name: str) -> Optional[uint32]:
        if self.wallet_state_manager is None:
            return None
        wallet = await CATWallet.get_or_create_wallet_for_cat(
            self.wallet_state_manager, self.wallet_state_manager.main_wallet, asset_id.hex(), name
        )
        return wallet.id()

    async def get_wallet_id_for_puzzle_hash(self, puzzle_hash: bytes32) -> Optional[Tuple[uint32, WalletType]]:
        if self.wallet_state_manager is None:
            return None
        wallet_id = await self.wallet_state_manager.get_wallet_id_for_puzzle_hash(puzzle_hash)
        return wallet_id

    async def get_wallet_id_for_coin(self, coin_id: bytes32) -> Optional[Tuple[uint32, WalletType]]:
        if self.wallet_state_manager is None:
            return None
        wallet_id = await self.wallet_state_manager.get_wallet_id_for_coin(coin_id)
        return wallet_id

    async def _update_pool_state_task(self, timestamp: uint64) -> None:
        if self.wallet_state_manager is None:
            return
        await self.wallet_state_manager.update_pool_state()

    async def _new_peak_queue_worker(self) -> None:
        while not self._shut_down:
            try:
                item: NewPeakItem = await self._new_peak_queue.get()
                await self.new_peak_wallet(item)
                self._new_peak_queue.task_done()
            except asyncio.CancelledError:
                self.log.warning("Queue task cancelled, exiting.")
                raise
            except Exception as e:
                self.log.error(f"Exception in new peak queue worker: {e}")

    async def validate_received_state_from_peer(
        self,
        coin_state: CoinState,
        peer: WSChiaConnection,
        peer_request_cache: Optional[PeerRequestCache] = None,
        fork_height: Optional[uint32] = None,
    ) -> bool:
        """
        Validate that the received state is valid.
        """
        if self.wallet_state_manager is None:
            return False

        # Only use the cache if we need to
        if peer_request_cache is None and peer.peer_node_id in self.peer_request_cache:
            peer_request_cache = self.peer_request_cache[peer.peer_node_id]
        if peer_request_cache is not None and await can_use_peer_request_cache(
            coin_state, peer_request_cache, fork_height
        ):
            return True

        spent_height: Optional[uint32] = None
        confirmed_height: Optional[uint32] = None
        if coin_state.spent_height is not None:
            spent_height = uint32(coin_state.spent_height)
        if coin_state.created_height is not None:
            confirmed_height = uint32(coin_state.created_height)

        # get last header
        request = RequestBlockHeader(confirmed_height if confirmed_height is not None else spent_height)
        coin_state_msg = await peer.call_api(ProtocolMessageTypes.request_block_header, request)
        if coin_state_msg is None:
            return False
        assert isinstance(coin_state_msg, RespondBlockHeader)
        confirmed_header_block = HeaderBlock.from_bytes(coin_state_msg.header_block)

        # get spent header
        spent_header_block: Optional[HeaderBlock] = None
        if spent_height is not None:
            request = RequestBlockHeader(spent_height)
            spent_coin_state_msg = await peer.call_api(ProtocolMessageTypes.request_block_header, request)
            if spent_coin_state_msg is None:
                return False
            assert isinstance(spent_coin_state_msg, RespondBlockHeader)
            spent_header_block = HeaderBlock.from_bytes(spent_coin_state_msg.header_block)

        # get coin
        request_1: Optional[RequestChildren] = None
        request_2: Optional[RequestChildren] = None
        if coin_state.created_height is not None:
            request_1 = RequestChildren(coin_state.created_height, coin_state.coin.parent_coin_info)
        if coin_state.spent_height is not None:
            request_2 = RequestChildren(coin_state.spent_height, coin_state.coin.parent_coin_info)

        children_1: Optional[RespondChildren] = None
        children_2: Optional[RespondChildren] = None

        if request_1 is not None:
            children_1 = await peer.call_api(ProtocolMessageTypes.request_children, request_1)
            if children_1 is None:
                return False
            assert isinstance(children_1, RespondChildren)

        if request_2 is not None and request_2 != request_1:
            children_2 = await peer.call_api(ProtocolMessageTypes.request_children, request_2)
            if children_2 is None:
                return False
            assert isinstance(children_2, RespondChildren)

        if children_1 is not None:
            for child in children_1.coin_states:
                if child.coin == coin_state.coin:
                    if child.created_height is not None:
                        if confirmed_height is not None:
                            if child.created_height != confirmed_height:
                                return False
                        confirmed_height = child.created_height

        if children_2 is not None:
            for child in children_2.coin_states:
                if child.coin == coin_state.coin:
                    if child.created_height is not None:
                        if confirmed_height is not None:
                            if child.created_height != confirmed_height:
                                return False
                        confirmed_height = child.created_height
                    if child.spent_height is not None:
                        if spent_height is not None:
                            if child.spent_height != spent_height:
                                return False
                        spent_height = child.spent_height

        if confirmed_height is None and coin_state.created_height is not None:
            confirmed_height = coin_state.created_height

        if spent_height is None and coin_state.spent_height is not None:
            spent_height = coin_state.spent_height

        if confirmed_height is None and spent_height is None:
            return False

        if confirmed_height is not None:
            if confirmed_header_block.height != confirmed_height:
                return False
            if confirmed_header_block.is_transaction_block is False:
                return False
            if (
                confirmed_header_block.foliage_transaction_block is None
                or confirmed_header_block.foliage_transaction_block.additions_root is None
            ):
                return False

        if spent_height is not None:
            if spent_header_block is None or spent_header_block.height != spent_height:
                return False
            if spent_header_block.is_transaction_block is False:
                return False
            if (
                spent_header_block.foliage_transaction_block is None
                or spent_header_block.foliage_transaction_block.removals_root is None
            ):
                return False

        if peer_request_cache is not None:
            if confirmed_height is not None:
                peer_request_cache.add_to_validated_heights(confirmed_height)
            if spent_height is not None:
                peer_request_cache.add_to_validated_heights(spent_height)

        return True

    async def get_coin_state_by_coin_id(
        self, coin_id: bytes32, fork_height: Optional[uint32] = None
    ) -> Optional[CoinState]:
        """
        Returns a CoinState for the coin_id if it exists in the blockchain
        """
        if self.wallet_state_manager is None:
            return None
        peer = self.get_full_node_peer()
        if peer is None:
            raise ValueError("No peer connected")
        coin_states = await self.get_coin_state([coin_id], peer=peer, fork_height=fork_height)
        if len(coin_states) == 0:
            return None
        return coin_states[0]

    async def fetch_children(
        self, coin_name: bytes32, fork_height: Optional[uint32] = None
    ) -> Optional[List[CoinState]]:
        """
        Returns the children of a coin if they exist in the blockchain
        """
        if self.wallet_state_manager is None:
            return None
        peer = self.get_full_node_peer()
        if peer is None:
            return None
        children = await self.fetch_children(coin_name, peer=peer, fork_height=fork_height)
        return children

    async def get_timestamp_for_height(self, height: uint32) -> uint64:
        """
        Returns the timestamp for transaction block at h=height, if not transaction block, backtracks until it finds
        a transaction block
        """
        if height >= self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            return uint64(height)

        if self.wallet_state_manager is None:
            raise ValueError("The wallet service is not initialized")

        for i in range(height, -1, -1):
            if i == 0:
                return uint64(self.constants.GENESIS_CHALLENGE_INITIALIZED_TIMESTAMP)
            block = await self.wallet_state_manager.blockchain.get_header_block_record(uint32(i))
            if block is not None and block.is_transaction_block:
                return block.timestamp

        raise ValueError(f"No transaction block found for height {height}")

    async def get_height_for_timestamp(self, timestamp: uint64) -> uint32:
        """
        Returns the height of the first block with timestamp > timestamp
        and that has a timestamp
        """
        if timestamp < self.constants.INITIAL_FREEZE_END_TIMESTAMP:
            blocks = await self.wallet_state_manager.blockchain.get_header_blocks_in_range(0, timestamp)
            for i in range(0, len(blocks)):
                if blocks[i].is_transaction_block and blocks[i].timestamp > timestamp:
                    return uint32(blocks[i].height)
            return uint32(0)
        else:
            return uint32(timestamp)

    async def process_clawback_auto_claim(self, wallet_id: int) -> Dict[str, Any]:
        """
        Processes the auto claim for a clawback wallet
        """
        if self.wallet_state_manager is None:
            raise ValueError("Wallet state manager not initialized")
        wallet = self.wallet_state_manager.wallets[uint32(wallet_id)]
        if wallet.type() == WalletType.CLAWBACK:
            assert isinstance(wallet, ClawbackWallet)
            return await wallet.process_auto_claim()
        return {}

    async def sync_job(self) -> None:
        """
        One sync job that runs forever. This is called by the scheduler in WalletNode.
        Handles syncing the wallet with the blockchain.
        """
        if self.wallet_state_manager is None:
            return

        wallet_state_manager = self.wallet_state_manager
        wallet_state_manager.set_sync_mode(True)
        retry_counter = 0
        retry_total_count = 3
        retry_sleep_interval = 5
        last_log_time = time.time()
        last_sync_log_time = time.time()
        sync_log_interval = 5 * 60  # 5 minutes
        retry_sleep_interval_max = 30
        retry_sleep_interval_step = 5
        while not self._shut_down:
            try:
                self.log.info("Starting sync job")
                peer: Optional[WSChiaConnection] = self.get_full_node_peer()
                if peer is None:
                    if time.time() - last_log_time > 60:
                        self.log.warning("No peers to sync with")
                        last_log_time = time.time()
                    else:
                        self.log.debug("No peers to sync with")
                    await asyncio.sleep(5)
                    continue

                start_time = time.time()
                self.log.info(f"Sync job started with peer {peer.peer_info.host}:{peer.peer_info.port}")

                # Get header hashes of all blocks
                request = wallet_protocol.RequestAllHeaderHashes()
                response: Optional[wallet_protocol.RespondAllHeaderHashes] = await peer.call_api(
                    ProtocolMessageTypes.request_all_header_hashes, request
                )
                if response is None:
                    self.log.warning("Sync job failed, no response from peer")
                    await asyncio.sleep(retry_sleep_interval)
                    retry_counter += 1
                    if retry_counter >= retry_total_count:
                        retry_counter = 0
                        retry_sleep_interval += retry_sleep_interval_step
                        if retry_sleep_interval > retry_sleep_interval_max:
                            retry_sleep_interval = retry_sleep_interval_max
                    continue

                # Get weight proof
                request = wallet_protocol.RequestHeaderBlocks(
                    response.starting_height, response.ending_height, False
                )
                header_blocks_response: Optional[wallet_protocol.RespondHeaderBlocks] = await peer.call_api(
                    ProtocolMessageTypes.request_header_blocks, request
                )
                if header_blocks_response is None:
                    self.log.warning("Sync job failed, no header blocks response from peer")
                    await asyncio.sleep(retry_sleep_interval)
                    retry_counter += 1
                    if retry_counter >= retry_total_count:
                        retry_counter = 0
                        retry_sleep_interval += retry_sleep_interval_step
                        if retry_sleep_interval > retry_sleep_interval_max:
                            retry_sleep_interval = retry_sleep_interval_max
                    continue

                # Process weight proof
                header_blocks = []
                for block in header_blocks_response.header_blocks:
                    header_blocks.append(HeaderBlock.from_bytes(block))

                # Add header blocks to the blockchain
                for header_block in header_blocks:
                    await wallet_state_manager.blockchain.add_block(header_block.header_hash, header_block.height)

                # Get the peak
                peak = wallet_state_manager.blockchain.get_peak()
                if peak is None:
                    self.log.warning("Sync job failed, no peak in blockchain")
                    await asyncio.sleep(retry_sleep_interval)
                    retry_counter += 1
                    if retry_counter >= retry_total_count:
                        retry_counter = 0
                        retry_sleep_interval += retry_sleep_interval_step
                        if retry_sleep_interval > retry_sleep_interval_max:
                            retry_sleep_interval = retry_sleep_interval_max
                    continue

                # Get the last sync height
                last_sync_height = await wallet_state_manager.blockchain.get_finished_sync_up_to()
                if last_sync_height is None:
                    last_sync_height = uint32(0)

                # Check if we need to sync
                if peak.height <= last_sync_height:
                    self.log.info(f"Sync job done, peak height: {peak.height}, last sync height: {last_sync_height}")
                    wallet_state_manager.set_sync_mode(False)
                    await asyncio.sleep(10)
                    continue

                # Get all puzzle hashes and coin ids we're interested in
                puzzle_hashes = await wallet_state_manager.puzzle_store.get_all_puzzle_hashes()
                coin_ids = await wallet_state_manager.interested_store.get_interested_coin_ids()

                # Get all coin states for puzzle hashes and coin ids
                coin_states = []
                for batch in chunks(puzzle_hashes, 1000):
                    states = await subscribe_to_phs(batch, peer, uint32(0), self.log)
                    coin_states.extend(states)
                for batch in chunks(coin_ids, 1000):
                    states = await subscribe_to_coin_updates(batch, peer, uint32(0), self.log)
                    coin_states.extend(states)

                # Process coin states
                if len(coin_states) > 0:
                    self.log.info(f"Sync job processing {len(coin_states)} coin states")
                    async with self._segment_validation_lock:
                        await wallet_state_manager.add_coin_states(coin_states, peer.peer_node_id, peak.height)

                # Get all puzzle hashes and coin ids we're interested in
                puzzle_hashes = await wallet_state_manager.puzzle_store.get_all_puzzle_hashes()
                coin_ids = await wallet_state_manager.interested_store.get_interested_coin_ids()

                # Subscribe to puzzle hashes and coin ids
                for batch in chunks(puzzle_hashes, 1000):
                    await subscribe_to_phs(batch, peer, last_sync_height, self.log)
                for batch in chunks(coin_ids, 1000):
                    await subscribe_to_coin_updates(batch, peer, last_sync_height, self.log)

                # Set the last sync height
                await wallet_state_manager.blockchain.set_finished_sync_up_to(peak.height)
                wallet_state_manager.set_sync_mode(False)

                # Log sync time
                end_time = time.time()
                sync_time = end_time - start_time
                if sync_time > 60:
                    self.log.info(f"Sync job done in {sync_time:0.2f} seconds")
                else:
                    self.log.info(f"Sync job done in {sync_time:0.2f} seconds")

                # Log sync status
                if time.time() - last_sync_log_time > sync_log_interval:
                    last_sync_log_time = time.time()
                    self.log.info(
                        f"Sync status: Peak height: {peak.height}, Last sync height: {last_sync_height}, "
                        f"Sync progress: {last_sync_height / peak.height * 100:0.2f}%"
                    )

                # Reset retry counter
                retry_counter = 0
                retry_sleep_interval = 5

                # Wait before next sync
                await asyncio.sleep(10)

            except asyncio.CancelledError:
                self.log.warning("Sync job cancelled, exiting")
                raise
            except Exception as e:
                self.log.error(f"Exception in sync job: {e}")
                wallet_state_manager.set_sync_mode(False)
                await asyncio.sleep(retry_sleep_interval)
                retry_counter += 1
                if retry_counter >= retry_total_count:
                    retry_counter = 0
                    retry_sleep_interval += retry_sleep_interval_step
                    if retry_sleep_interval > retry_sleep_interval_max:
                        retry_sleep_interval = retry_sleep_interval_max