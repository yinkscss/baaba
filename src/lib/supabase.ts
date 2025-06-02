import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These would normally be in environment variables
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);