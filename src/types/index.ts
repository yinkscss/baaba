export type UserRole = 'tenant' | 'landlord';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
  size: number; // in square meters
  amenities: string[];
  images: string[];
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  available: boolean;
  featured: boolean;
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
  cleanliness: number; // 1-5
  noise: number; // 1-5
  visitors: number; // 1-5
  smokingTolerance: boolean;
  petsTolerance: boolean;
  spotifyProfileUrl?: string;
  createdAt: string;
  updatedAt: string;
}