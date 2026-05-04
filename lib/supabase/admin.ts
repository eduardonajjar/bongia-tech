import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com service role — tem acesso a auth.admin.*
 * Usar apenas em rotas server-side (API routes). Nunca expor no cliente.
 */
const stripBOM = (s: string) => s.replace(/^﻿/, '').trim()

export function createAdminClient() {
  return createClient(
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
