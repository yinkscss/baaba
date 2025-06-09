// Dashboard-specific types that extend the main types
export interface DashboardStats {
  id: string;
  userId: string;
  propertiesViewed: number;
  savedProperties: number;
  activeApplications: number;
  totalProperties: number;
  totalIncome: number;
  occupancyRate: number;
  lastUpdated: string;
}

export interface PaymentSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  paymentCount: number;
}

export interface PropertyAnalytics {
  viewCount: number;
  applicationCount: number;
  averageViewTime: number;
  conversionRate: number;
  popularAmenities: string[];
}

export interface TenantProfile {
  id: string;
  userId: string;
  preferences: {
    budget: number;
    location: string;
    bedrooms: number;
    amenities: string[];
  };
  verificationStatus: {
    identity: boolean;
    income: boolean;
    references: boolean;
  };
  applicationHistory: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export interface LandlordProfile {
  id: string;
  userId: string;
  portfolio: {
    totalProperties: number;
    activeListings: number;
    occupancyRate: number;
    averageRent: number;
  };
  performance: {
    responseTime: number;
    tenantSatisfaction: number;
    renewalRate: number;
  };
  verification: {
    identity: boolean;
    business: boolean;
    insurance: boolean;
  };
}

export interface AgentProfile {
  id: string;
  userId: string;
  managedProperties: number;
  managedLandlords: number;
  commissionEarned: number;
  performance: {
    averageResponseTime: number;
    clientSatisfaction: number;
    dealsClosed: number;
  };
  verification: {
    license: boolean;
    identity: boolean;
    background: boolean;
  };
}

// Message-related types for dashboard
export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

// Workflow states
export type PaymentWorkflowState = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type ApplicationWorkflowState = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export type VerificationWorkflowState = 
  | 'not_started'
  | 'in_progress'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'expired';