export type UserRole = 'tenant' | 'landlord' | 'agent' | 'pending';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  verified: boolean;
  notificationPreferences?: Record<string, boolean>;
  schoolIdVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities: string[];
  images: string[];
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  available: boolean;
  featured: boolean;
  status: 'active' | 'paused' | 'rented';
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface RoommatePreference {
  id: string;
  userId: string;
  budget: number;
  location: string;
  moveInDate: string;
  gender: 'male' | 'female' | 'any';
  cleanliness: number;
  noise: number;
  visitors: number;
  smokingTolerance: boolean;
  petsTolerance: boolean;
  spotifyProfileUrl?: string;
  createdAt: string;
  updatedAt: string;
}