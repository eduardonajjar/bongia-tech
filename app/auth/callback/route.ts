import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripBOM = (s: string) => (s || '').replace(/[﻿]/g, '').trim()

export async function GET(req: NextRequest) {
  const token_hash = req.nextUrl.searchParams.get('token_hash')
  const type = req.nextUrl.searchParams.get('type') as 'magiclink' | 'email'
  const next = req.nextUrl.searchParams.get('next') || '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?erro=sem_token', req.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  // Verifica o OTP token_hash — isso cria a sessão e seta os cookies automaticamente
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  })

  if (error) {
    console.error('[auth/callback] erro verifyOtp:', error.message)
    return NextResponse.redirect(
      new URL(`/login?erro=sessao&detalhe=${encodeURIComponent(error.message)}`, req.url)
    )
  }

  // Sessão criada com sucesso via cookies — redireciona pro dashboard
  return NextResponse.redirect(new URL(next, req.url))
}
