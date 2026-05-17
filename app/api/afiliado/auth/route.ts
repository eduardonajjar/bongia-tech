import { NextRequest, NextResponse } from 'next/server'
import { verificarTokenMagico, gerarSessionToken, COOKIE_SESSION, COOKIE_MAX_AGE } from '@/lib/afiliado/session'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || ''
  const email = verificarTokenMagico(token)

  if (!email) {
    return NextResponse.redirect(new URL('/afiliado/login?erro=link_expirado', APP_URL))
  }

  // Cria session de 7 dias
  const sessionToken = gerarSessionToken(email)
  const res = NextResponse.redirect(new URL('/afiliado/dashboard', APP_URL))

  res.cookies.set(COOKIE_SESSION, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return res
}
