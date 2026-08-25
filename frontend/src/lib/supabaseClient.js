import { createClient } from '@supabase/supabase-js'

// Credentials are hardcoded here so the Vercel-deployed build uses the correct
// project regardless of what env vars the Vercel dashboard has configured.
// The anon/publishable key is safe to commit — it is designed to be public.
const supabaseUrl = 'https://doqzbeqzxfjnzzekykoz.supabase.co'
const supabaseAnonKey = 'sb_publishable_YbD-myOzUV1dtc3CP0GZhA_MfCk_yEB'

// Initialize the Supabase client safely
let supabaseInstance = null;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

export const supabase = supabaseInstance;

if (!supabase) {
  console.warn("Supabase client failed to initialize.");
}
