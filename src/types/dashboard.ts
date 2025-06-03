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