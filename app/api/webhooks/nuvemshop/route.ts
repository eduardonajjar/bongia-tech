import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { atribuirVenda } from '@/lib/tracking/attribution'
import { enviarNotificacaoVenda } from '@/lib/integrations/resend'
import { obterPedido, obterSessionIdDoPedido } from '@/lib/integrations/nuvemshop'

const stripBOM = (s: string) => (s || '').replace(/[﻿]/g, '').trim()

/**
 * Valida a assinatura HMAC-SHA256 da Nuvemshop.
 * O secret usado é o CLIENT_SECRET global do app (não o access_token do lojista).
 * Header: x-linkedstore-hmac-sha256
 */
async function validarHMAC(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = stripBOM(process.env.NUVEMSHOP_CLIENT_SECRET || '')
  if (!secret) return true // Se não tiver secret configurado, pula a validação (dev)

  const hmacHeader = req.headers.get('x-linkedstore-hmac-sha256') || ''
  if (!hmacHeader) {
    console.warn('[webhook] header HMAC ausente')
    return false
  }

  const hmacCalculado = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  try {
    return timingSafeEqual(
      Buffer.from(hmacCalculado, 'hex'),
      Buffer.from(hmacHeader, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // ─── 1. Ler raw body ANTES de qualquer parse ─────────────────────────────
  const rawBody = await req.text()

  // ─── 2. Validar HMAC ─────────────────────────────────────────────────────
  const hmacValido = await validarHMAC(req, rawBody)
  if (!hmacValido) {
    console.warn('[webhook] HMAC inválido — requisição rejeitada')
    return NextResponse.json({ ok: false, erro: 'Assinatura inválida' }, { status: 401 })
  }

  try {
    const body = JSON.parse(rawBody)

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
      .select('id, comissao_padrao, nuvemshop_token, nuvemshop_custom_field_id')
      .eq('nuvemshop_store_id', storeId)
      .eq('ativo', true)
      .single()

    if (!lojista) {
      return NextResponse.json({ ok: false, erro: 'Lojista não encontrado' }, { status: 404 })
    }

    // ─── Busca pedido completo via API para ter subtotal, note e produtos ──
    let valorProdutos = 0
    let noteDoPedido = body.note || ''
    let numeroPedido: string | undefined
    let produtos: { nome: string; quantidade: number; preco_unitario: number; total: number }[] | undefined

    try {
      const pedido = await obterPedido(lojista.nuvemshop_token, storeId, pedidoId)

      // Número legível do pedido (ex: "1042")
      numeroPedido = String((pedido as any).number || pedidoId)

      // Produtos com nome, qtd, preço unitário e total
      if (pedido.products && Array.isArray(pedido.products)) {
        produtos = pedido.products.map((item: any) => {
          const precoUnit = parseFloat(item.price || '0')
          const qty = item.quantity || 1
          return {
            nome: item.name || 'Produto',
            quantidade: qty,
            preco_unitario: precoUnit,
            total: parseFloat((precoUnit * qty).toFixed(2)),
          }
        })
        valorProdutos = produtos.reduce((s, p) => s + p.total, 0)
      }

      // Fallback: subtotal do pedido se disponível
      if (!valorProdutos) {
        valorProdutos = parseFloat((pedido as any).subtotal || pedido.total || body.total || '0')
      }

      noteDoPedido = (pedido as any).note || body.note || ''
      console.log('[webhook] pedido', numeroPedido, 'valorProdutos:', valorProdutos, 'note:', noteDoPedido)
    } catch (e) {
      valorProdutos = parseFloat(body.subtotal || body.total || '0')
      console.warn('[webhook] erro ao buscar pedido via API, usando fallback:', e)
    }

    if (valorProdutos <= 0) {
      return NextResponse.json({ ok: false, erro: 'Valor do pedido inválido' }, { status: 400 })
    }

    // ─── Extrai session_id: custom field (novo) → nota (retrocompatível) ──
    let sessionId: string | null = null
    const customFieldId = (lojista as any).nuvemshop_custom_field_id as string | null

    if (customFieldId) {
      sessionId = await obterSessionIdDoPedido(
        lojista.nuvemshop_token, storeId, pedidoId, customFieldId
      ).catch(() => null)
      if (sessionId) console.log('[webhook] sessionId via custom field:', sessionId)
    }

    // Fallback: lê da nota do pedido (pedidos antes da migração)
    if (!sessionId) {
      sessionId = extrairSessionId(noteDoPedido)
      if (sessionId) console.log('[webhook] sessionId via nota (legado):', sessionId)
    }

    console.log('[webhook] sessionId final:', sessionId)

    const venda = await atribuirVenda({
      lojistaId: lojista.id,
      pedidoId,
      valorProdutos,
      sessionId,
      comissaoPadrao: lojista.comissao_padrao,
      numeroPedido,
      produtos,
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

function extrairSessionId(note: string | null | undefined): string | null {
  if (!note) return null
  const match = note.match(/bt=([a-f0-9\-]{32,36})/i)
  return match ? match[1] : null
}
