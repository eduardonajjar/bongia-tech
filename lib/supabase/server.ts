import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const stripBOM = (s: string) => (s || '').replace(/﻿/g, '').trim()

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Service role client — bypassa RLS, não precisa de cookies
export async function createServiceClient() {
  return createSupabaseClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    stripBOM(process.env.SUPABASE_SERVICE_ROLE_KEY || ''),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
