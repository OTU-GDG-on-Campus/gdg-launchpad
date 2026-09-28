// Types for the VITE_-prefixed environment variables. Everything declared here ships to the
// browser and is public, so no secret may ever be added to this list. See .env.example.

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
