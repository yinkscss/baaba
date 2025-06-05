import type { User, Property } from './index';

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

export interface Notification {
  id: string;
  userId: string;
  type: 'property' | 'application' | 'payment' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'view' | 'save' | 'apply' | 'message' | 'payment';
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Lease {
  id: string;
  userId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  leaseDocumentUrl?: string;
  landlordContactId?: string;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  landlordContact?: User;
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  paymentDate: string;
  status: 'paid' | 'pending' | 'overdue';
  transactionId?: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  propertyId?: string;
  subject: string;
  description: string;
  category: 'maintenance' | 'noise' | 'billing' | 'security' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  resolutionNotes?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  requestedDate: string;
  message: string;
  status: 'new' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  property?: Property;
  tenant?: User;
}

export interface EscrowTransaction {
  id: string;
  leaseId: string;
  amount: number;
  status: 'pending_release' | 'released' | 'refunded';
  initiatedAt: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
  lease?: Lease;
}