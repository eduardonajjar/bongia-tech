import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { atribuirVenda } from '@/lib/tracking/attribution'
import { enviarNotificacaoVenda } from '@/lib/integrations/resend'
import { obterPedido } from '@/lib/integrations/nuvemshop'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.event !== 'order/paid') {
      return NextResponse.json({ ok: true })
    }

    const storeId = String(body.store_id || '')
    const pedidoId = String(body.id || '')

    if (!storeId || !pedidoId) {
      return NextResponse.json({ ok: false, erro: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: lojista } = await supabase
      .from('lojistas')
      .select('id, comissao_padrao, nuvemshop_token')
      .eq('nuvemshop_store_id', storeId)
      .eq('ativo', true)
      .single()

    if (!lojista) {
      return NextResponse.json({ ok: false, erro: 'Lojista não encontrado' }, { status: 404 })
    }

    // ─── Busca pedido completo via API para ter subtotal e note precisos ───
    let valorProdutos = 0
    let noteDoPedido = body.note || ''

    try {
      const pedido = await obterPedido(lojista.nuvemshop_token, storeId, pedidoId)

      // Valor base = soma dos produtos (price × quantity) — exclui frete
      if (pedido.products && Array.isArray(pedido.products)) {
        valorProdutos = pedido.products.reduce(function (soma: number, item: any) {
          return soma + (parseFloat(item.price || '0') * (item.quantity || 1))
        }, 0)
      }

      // Fallback: subtotal do pedido se disponível (Nuvemshop: subtotal = produtos sem frete)
      if (!valorProdutos) {
        valorProdutos = parseFloat((pedido as any).subtotal || pedido.total || body.total || '0')
      }

      // Nota do pedido (onde o tracker.js injeta o bt=SESSION_ID)
      noteDoPedido = (pedido as any).note || body.note || ''

      console.log('[webhook] pedido', pedidoId, 'valorProdutos:', valorProdutos, 'note:', noteDoPedido)
    } catch (e) {
      // Se API falhar, usa o que veio no webhook
      valorProdutos = parseFloat(body.subtotal || body.total || '0')
      console.warn('[webhook] erro ao buscar pedido via API, usando fallback:', e)
    }

    if (valorProdutos <= 0) {
      return NextResponse.json({ ok: false, erro: 'Valor do pedido inválido' }, { status: 400 })
    }

    // ─── Extrai session_id da nota do pedido ──────────────────────────────
    // O tracker.js injeta: "bt=UUID" na nota do pedido
    const sessionId = extrairSessionId(noteDoPedido)
    console.log('[webhook] sessionId extraído:', sessionId)

    const venda = await atribuirVenda({
      lojistaId: lojista.id,
      pedidoId,
      valorProdutos,
      sessionId,
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

    return NextResponse.json({ ok: true, atribuida: !!venda, sessionId })
  } catch (err) {
    console.error('[webhook] erro:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

/**
 * Extrai o bt=SESSION_ID da nota do pedido.
 * O tracker.js injeta no formato: "bt=UUID" (pode ter texto antes/depois)
 */
function extrairSessionId(note: string | null | undefined): string | null {
  if (!note) return null
  const match = note.match(/bt=([a-f0-9\-]{32,36})/i)
  return match ? match[1] : null
}
