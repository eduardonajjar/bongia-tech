import { createBrowserClient } from '@supabase/ssr'

const stripBOM = (s: string) => (s || '').replace(/[﻿]/g, '').trim()

export function createClient() {
  return createBrowserClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  )
}
