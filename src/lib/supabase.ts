import { createClient } from "@supabase/supabase-js";

// Uses VITE_ prefix so it's exposed to the Vite build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project-id.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
