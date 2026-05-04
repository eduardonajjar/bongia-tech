import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Webhook da Nuvemshop: store/redact, customers/redact, customers/data_request
// Também aceita DELETE manual por token (uso interno)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Apenas confirma recebimento — Nuvemshop exige 200
    // Tipos: store_id (store/redact), customer_id (customers/redact, customers/data_request)
    const storeId = body?.store_id
    const supabase = await createServiceClient()

    if (storeId) {
      // Lojista desinstalou o app: anonimizar dados da loja
      await supabase
        .from('lojistas')
        .update({
          nuvemshop_token: null,
          nuvemshop_store_id: null,
          pagamento_automatico_ativo: false,
        })
        .eq('nuvemshop_store_id', String(storeId))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // sempre 200 para a Nuvemshop
  }
}

// Exclusão manual de afiliado por token (uso interno do dashboard)
export async function DELETE(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ erro: 'Token obrigatório' }, { status: 400 })

  const supabase = await createServiceClient()

  const { data: afiliado } = await supabase
    .from('afiliados')
    .select('id')
    .eq('token', token)
    .single()

  if (!afiliado) return NextResponse.json({ erro: 'Afiliado não encontrado' }, { status: 404 })

  await supabase.from('cliques').delete().eq('afiliado_id', afiliado.id)
  await supabase.from('afiliados').update({
    nome: '[removido]',
    email: '[removido]',
    chave_pix: null,
    ativo: false,
  }).eq('id', afiliado.id)

  return NextResponse.json({ ok: true })
}
