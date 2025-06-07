export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_landlords: {
        Row: {
          agent_id: string
          created_at: string | null
          landlord_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          landlord_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          landlord_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_landlords_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_landlords_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          agent_id: string
          amount: number
          created_at: string | null
          id: string
          lease_id: string
          notes: string | null
          payout_date: string | null
          status: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string | null
          id?: string
          lease_id: string
          notes?: string | null
          payout_date?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          lease_id?: string
          notes?: string | null
          payout_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string
          property_id: string | null
          rating: number | null
          resolution_notes: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority: string
          property_id?: string | null
          rating?: number | null
          resolution_notes?: string | null
          status: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          property_id?: string | null
          rating?: number | null
          resolution_notes?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "agent_managed_properties_view"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_stats: {
        Row: {
          active_applications: number | null
          id: string
          last_updated: string | null
          occupancy_rate: number | null
          properties_viewed: number | null
          saved_properties: number | null
          total_income: number | null
          total_properties: number | null
          user_id: string
        }
        Insert: {
          active_applications?: number | null
          id?: string
          last_updated?: string | null
          occupancy_rate?: number | null
          properties_viewed?: number | null
          saved_properties?: number | null
          total_income?: number | null
          total_properties?: number | null
          user_id: string
        }
        Update: {
          active_applications?: number | null
          id?: string
          last_updated?: string | null
          occupancy_rate?: number | null
          properties_viewed?: number | null
          saved_properties?: number | null
          total_income?: number | null
          total_properties?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          initiated_at: string
          lease_id: string
          released_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          initiated_at?: string
          lease_id: string
          released_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          initiated_at?: string
          lease_id?: string
          released_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string
          property_id: string
          requested_date: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          property_id: string
          requested_date: string
          status: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          property_id?: string
          requested_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "agent_managed_properties_view"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "inspection_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          landlord_contact_id: string | null
          lease_document_url: string | null
          property_id: string
          rent_amount: number
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          landlord_contact_id?: string | null
          lease_document_url?: string | null
          property_id: string
          rent_amount: number
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          landlord_contact_id?: string | null
          lease_document_url?: string | null
          property_id?: string
          rent_amount?: number
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_landlord_contact_id_fkey"
            columns: ["landlord_contact_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "agent_managed_properties_view"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          lease_id: string
          payment_date: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          lease_id: string
          payment_date: string
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          lease_id?: string
          payment_date?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          available: boolean | null
          bathrooms: number
          bedrooms: number
          created_at: string | null
          description: string
          featured: boolean | null
          id: string
          images: string[] | null
          landlord_id: string
          location: string
          price: number
          size: number
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available?: boolean | null
          bathrooms: number
          bedrooms: number
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          landlord_id: string
          location: string
          price: number
          size: number
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available?: boolean | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          landlord_id?: string
          location?: string
          price?: number
          size?: number
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roommate_preferences: {
        Row: {
          budget: number
          cleanliness: number
          created_at: string | null
          gender: string
          id: string
          location: string
          move_in_date: string
          noise: number
          pets_tolerance: boolean | null
          smoking_tolerance: boolean | null
          spotify_profile_url: string | null
          updated_at: string | null
          user_id: string
          visitors: number
        }
        Insert: {
          budget: number
          cleanliness: number
          created_at?: string | null
          gender: string
          id?: string
          location: string
          move_in_date: string
          noise: number
          pets_tolerance?: boolean | null
          smoking_tolerance?: boolean | null
          spotify_profile_url?: string | null
          updated_at?: string | null
          user_id: string
          visitors: number
        }
        Update: {
          budget?: number
          cleanliness?: number
          created_at?: string | null
          gender?: string
          id?: string
          location?: string
          move_in_date?: string
          noise?: number
          pets_tolerance?: boolean | null
          smoking_tolerance?: boolean | null
          spotify_profile_url?: string | null
          updated_at?: string | null
          user_id?: string
          visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "roommate_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          notification_preferences: Json | null
          phone_number: string | null
          phone_verified: boolean | null
          profile_image: string | null
          role: string
          school_id_verified: boolean | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          notification_preferences?: Json | null
          phone_number?: string | null
          phone_verified?: boolean | null
          profile_image?: string | null
          role: string
          school_id_verified?: boolean | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notification_preferences?: Json | null
          phone_number?: string | null
          phone_verified?: boolean | null
          profile_image?: string | null
          role?: string
          school_id_verified?: boolean | null
          verified?: boolean | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          document_url: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          document_url: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          document_url?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_managed_properties_view: {
        Row: {
          agent_id: string | null
          property_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_landlords_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_orphaned_conversations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_agent_managed_properties_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
