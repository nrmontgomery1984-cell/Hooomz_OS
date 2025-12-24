import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging at module init
console.log('[supabase.js] Module initializing...');
console.log('[supabase.js] VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
console.log('[supabase.js] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase.js] Supabase credentials not found. Using mock data mode.');
}

// Configure Supabase client
// Note: persistSession disabled to prevent auth from blocking data queries
// Users will need to log in each session, but data loading will be reliable
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

console.log('[supabase.js] Supabase client created:', !!supabase);

export const isSupabaseConfigured = () => {
  return !!supabase;
};
