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
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  return {
    ...query,
    sendMessage,
    markAsRead
  };
}