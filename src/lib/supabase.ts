import { createClient } from "@supabase/supabase-js";

// Uses VITE_ prefix so it's exposed to the Vite build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project-id.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client used ONLY for prototyping (bypasses RLS and can manage Auth)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
