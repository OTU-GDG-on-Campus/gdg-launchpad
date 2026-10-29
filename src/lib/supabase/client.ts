// The single Supabase client, consumed only by the API seam or auth infrastructure.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False until .env.local is filled in, which lets the app fall back to mock data in dev. */
export const isSupabaseConfigured = Boolean(url && anonKey)

function createStub(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(
        'Supabase is not configured. Copy .env.example to .env.local and fill in ' +
          'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See docs/supabase.md.',
      )
    },
  })
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createStub()
