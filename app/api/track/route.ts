import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ref_code, session_id, url_origem } = body

    if (!ref_code || !session_id) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: afiliado } = await supabase
      .from('afiliados')
      .select('id')
      .eq('ref_code', ref_code)
      .eq('ativo', true)
      .single()

    if (!afiliado) {
      return NextResponse.json({ ok: false }, { status: 404 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip')
    const userAgent = req.headers.get('user-agent')

    await supabase.from('cliques').insert({
      afiliado_id: afiliado.id,
      session_id,
      ip,
      user_agent: userAgent,
      url_origem: url_origem || null,
    })

    await supabase
      .from('afiliados')
      .update({ total_cliques: supabase.rpc('total_cliques') })
      .eq('id', afiliado.id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
