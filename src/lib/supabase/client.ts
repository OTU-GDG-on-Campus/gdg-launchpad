// The one configured Supabase browser client. Only lib/api/client.ts and lib/auth may import it,
// so the data seam described in AGENTS.md stays intact.

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
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : createStub()
