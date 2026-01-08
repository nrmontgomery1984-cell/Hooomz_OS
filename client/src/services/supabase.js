import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only log in development, and don't expose credentials
if (import.meta.env.DEV) {
  logger.debug('Supabase module initializing', {
    urlConfigured: !!supabaseUrl,
    keyConfigured: !!supabaseAnonKey,
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Supabase credentials not found - using mock data mode');
}

// Configure Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = () => {
  return !!supabase;
};
