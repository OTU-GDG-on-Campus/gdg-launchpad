// Browser Supabase client, or null when the env vars are unset so the app still runs on mock data.
// Only lib/api/client.ts may import this.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true },
      })
    : null
