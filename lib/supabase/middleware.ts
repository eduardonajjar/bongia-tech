import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const stripBOM = (s: string) => (s || '').replace(/[﻿]/g, '').trim()
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/registro')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAdminRoute) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Adiciona pathname como header para server components lerem
  supabaseResponse.headers.set('x-pathname', pathname)
  return supabaseResponse
}
