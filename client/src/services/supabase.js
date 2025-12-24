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

// Configure Supabase client with session persistence but custom storage
// This allows "stay logged in" while preventing auth from blocking data queries
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: {
          // Custom storage that doesn't block on corrupted data
          getItem: (key) => {
            try {
              return localStorage.getItem(key);
            } catch {
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
            } catch {
              // Ignore storage errors
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
            } catch {
              // Ignore storage errors
            }
          },
        },
      },
      global: {
        headers: {
          'x-client-info': 'hooomz-os',
        },
      },
    })
  : null;

console.log('[supabase.js] Supabase client created:', !!supabase);

export const isSupabaseConfigured = () => {
  return !!supabase;
};
