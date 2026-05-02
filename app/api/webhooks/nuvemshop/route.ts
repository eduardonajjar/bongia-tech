import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { atribuirVenda } from '@/lib/tracking/attribution'
import { enviarNotificacaoVenda } from '@/lib/integrations/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Nuvemshop envia: { store_id, event, id (order_id), ... }
    if (body.event !== 'order/paid') {
      return NextResponse.json({ ok: true })
    }

    const storeId = String(body.store_id)
    const pedidoId = String(body.id)
    const valorPedido = parseFloat(body.total || '0')

    if (!storeId || !pedidoId || valorPedido <= 0) {
      return NextResponse.json({ ok: false, erro: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: lojista } = await supabase
      .from('lojistas')
      .select('id, comissao_padrao')
      .eq('nuvemshop_store_id', storeId)
      .eq('ativo', true)
      .single()

    if (!lojista) {
      return NextResponse.json({ ok: false, erro: 'Lojista não encontrado' }, { status: 404 })
    }

    // Buscar session_id do pedido via cookie do cliente
    // A Nuvemshop pode mandar o session_id nos metadados se implementarmos o app
    const cookieHeader = body.note || null

    const venda = await atribuirVenda({
      lojistaId: lojista.id,
      pedidoId,
      valorPedido,
      cookieHeader,
      comissaoPadrao: lojista.comissao_padrao,
    })

    if (venda) {
      const { data: afiliado } = await supabase
        .from('afiliados')
        .select('nome, email, token, saldo')
        .eq('id', venda.afiliado_id)
        .single()

      if (afiliado) {
        await enviarNotificacaoVenda({
          nome: afiliado.nome,
          email: afiliado.email,
          valorComissao: venda.valor_comissao,
          saldoAtual: afiliado.saldo,
          token: afiliado.token,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, atribuida: !!venda })
  } catch (err) {
    console.error('Webhook Nuvemshop error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
