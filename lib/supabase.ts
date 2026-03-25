import { createClient } from "@supabase/supabase-js"

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Supabase env vars not configured")
  return createClient(url, key)
}

// Server-side client with service role (for API routes)
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || (!anonKey && !serviceKey)) {
    throw new Error("Supabase env vars not configured")
  }

  const key = serviceKey || anonKey!
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

