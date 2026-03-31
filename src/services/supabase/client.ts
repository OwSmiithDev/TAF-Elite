import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Using the provided keys directly for the application to work immediately
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://elaomrrxpnpahkgdyesy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYW9tcnJ4cG5wYWhrZ2R5ZXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTQzMzcsImV4cCI6MjA5MDQ5MDMzN30.AmbVur8dGTQ7EK62lxQ-AbrZvPTCQveiJdvAecq1EaI';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

export const supabase = isSupabaseConfigured
  ? createClient<any>(supabaseUrl, supabaseAnonKey)
  : ({} as any); // Mock client

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. The app is running in UI-only mode.'
  );
}
