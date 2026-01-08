/**
 * API Configuration
 *
 * Central Supabase client setup and configuration.
 * All API modules import from here.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Check if Supabase is properly configured
 */
export function isConfigured() {
  return !!supabase;
}

/**
 * Generate a UUID for new records
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Get current ISO timestamp
 */
export function now() {
  return new Date().toISOString();
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Standard API response format
 * @param {any} data - The data to return
 * @param {string|null} error - Error message if any
 */
export function response(data, error = null) {
  return { data, error };
}

/**
 * Handle Supabase errors consistently
 * @param {Error} error - The error object
 * @param {string} operation - Description of the operation
 */
export function handleError(error, operation) {
  console.error(`[API] ${operation} failed:`, error);
  return response(null, error?.message || `${operation} failed`);
}
