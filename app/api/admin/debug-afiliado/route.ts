import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { obterLoja } from '@/lib/integrations/nuvemshop'

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
      .select('id, email, nuvemshop_token, nuvemshop_store_id, nuvemshop_store_url')
      .eq('id', afiliado.lojista_id)
      .maybeSingle() : { data: null, error: null }

    // Tenta buscar e salvar a URL da loja se estiver null
    let storeUrlFetched = null
    let erroFetch = null
    if (lojista && !lojista.nuvemshop_store_url && lojista.nuvemshop_token) {
      try {
        const lojaInfo = await obterLoja(lojista.nuvemshop_token, lojista.nuvemshop_store_id)
        storeUrlFetched = lojaInfo.url
        // Salva no banco
        await supabase
          .from('lojistas')
          .update({ nuvemshop_store_url: storeUrlFetched } as any)
          .eq('id', lojista.id)
      } catch (err) {
        erroFetch = String(err)
      }
    }

    return NextResponse.json({
      ref,
      afiliado,
      erroAfiliado: e1?.message,
      lojista: lojista ? { ...lojista, nuvemshop_token: lojista.nuvemshop_token ? '***' : null } : null,
      erroLojista: e2?.message,
      storeUrlFetched,
      erroFetch,
    })
  } catch (err) {
    return NextResponse.json({ erro: String(err) }, { status: 500 })
  }
}
