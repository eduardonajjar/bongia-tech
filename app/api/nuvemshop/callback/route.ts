import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trocarCodigoPorToken, registrarWebhook } from '@/lib/integrations/nuvemshop'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/integracao?erro=sem_codigo', req.url))
  }

  try {
    const { access_token, user_id } = await trocarCodigoPorToken(
      process.env.NUVEMSHOP_CLIENT_ID!,
      process.env.NUVEMSHOP_CLIENT_SECRET!,
      code
    )

    await supabase
      .from('lojistas')
      .update({
        nuvemshop_token: access_token,
        nuvemshop_store_id: user_id,
      })
      .eq('id', user.id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await registrarWebhook(
      access_token,
      user_id,
      `${appUrl}/api/webhooks/nuvemshop`
    ).catch(() => {})

    return NextResponse.redirect(new URL('/dashboard/integracao?ok=nuvemshop', req.url))
  } catch {
    return NextResponse.redirect(new URL('/dashboard/integracao?erro=nuvemshop', req.url))
  }
}
