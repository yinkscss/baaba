import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These would normally be in environment variables
const supabaseUrl = 'https://hjojzguhuqymadaatost.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqb2p6Z3VodXF5bWFkYWF0b3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDQxODcsImV4cCI6MjA2NDQ4MDE4N30.97XRm15_QKMK78F8qJwiuY4ROM64U-MYL4L2bnPLIpI';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);