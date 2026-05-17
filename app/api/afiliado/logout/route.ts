import { NextResponse } from 'next/server'
import { COOKIE_SESSION } from '@/lib/afiliado/session'

export async function GET() {
  const res = NextResponse.redirect(
    new URL('/afiliado/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )
  res.cookies.delete(COOKIE_SESSION)
  return res
}
