export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          location: string
          address: string
          bedrooms: number
          bathrooms: number
          size: number
          amenities: string[]
          images: string[]
          landlord_id: string
          created_at: string
          updated_at: string
          available: boolean
          featured: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          location: string
          address: string
          bedrooms: number
          bathrooms: number
          size: number
          amenities: string[]
          images: string[]
          landlord_id: string
          created_at?: string
          updated_at?: string
          available?: boolean
          featured?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          location?: string
          address?: string
          bedrooms?: number
          bathrooms?: number
          size?: number
          amenities?: string[]
          images?: string[]
          landlord_id?: string
          created_at?: string
          updated_at?: string
          available?: boolean
          featured?: boolean
        }
      }
      roommate_preferences: {
        Row: {
          id: string
          user_id: string
          budget: number
          location: string
          move_in_date: string
          gender: string
          cleanliness: number
          noise: number
          visitors: number
          smoking_tolerance: boolean
          pets_tolerance: boolean
          spotify_profile_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget: number
          location: string
          move_in_date: string
          gender: string
          cleanliness: number
          noise: number
          visitors: number
          smoking_tolerance: boolean
          pets_tolerance: boolean
          spotify_profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget?: number
          location?: string
          move_in_date?: string
          gender?: string
          cleanliness?: number
          noise?: number
          visitors?: number
          smoking_tolerance?: boolean
          pets_tolerance?: boolean
          spotify_profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_plans: {
        Row: {
          id: string
          name: string
          price: number
          interval: string
          features: string[]
        }
        Insert: {
          id?: string
          name: string
          price: number
          interval: string
          features: string[]
        }
        Update: {
          id?: string
          name?: string
          price?: number
          interval?: string
          features?: string[]
        }
      }
    }
  }
}