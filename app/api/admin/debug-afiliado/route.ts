import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref') || 'eduardor0u2h'

  try {
    const supabase = await createServiceClient()

    const { data: afiliado, error: e1 } = await supabase
      .from('afiliados')
      .select('id, lojista_id, ref_code, ativo')
      .eq('ref_code', ref)
      .maybeSingle()

    const { data: lojista, error: e2 } = afiliado ? await supabase
      .from('lojistas')
      .select('id, email, nuvemshop_store_id, nuvemshop_store_url')
      .eq('id', afiliado.lojista_id)
      .maybeSingle() : { data: null, error: null }

    return NextResponse.json({
      ref,
      afiliado,
      erroAfiliado: e1?.message,
      lojista,
      erroLojista: e2?.message,
    })
  } catch (err) {
    return NextResponse.json({ erro: String(err) }, { status: 500 })
  }
}
