/**
 * Webhook handler: order/created
 *
 * Objetivo: injetar bt=SESSION_ID na nota do pedido ANTES do pagamento,
 * resolvendo o problema do Checkout V3 que não executa o tracker.js.
 *
 * Estratégia de match (em ordem de precisão):
 * 1. browser_ip: busca clique com mesmo IP do comprador → match preciso
 * 2. Fallback: clique mais recente da loja não atribuído → menor precisão
 *
 * Limitação conhecida (aceitável para MVP):
 * Se dois clientes comprarem simultaneamente via afiliados diferentes com
 * o mesmo IP (ex: mesmo escritório/rede), pode haver atribuição errada.
 * Isso é raro na prática e será mitigado com NubeSDK futuramente.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { atualizarNotaPedido } from '@/lib/integrations/nuvemshop'

const stripBOM = (s: string) => (s || '').replace(/[﻿]/g, '').trim()

async function validarHMAC(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = stripBOM(process.env.NUVEMSHOP_CLIENT_SECRET || '')
  if (!secret) return true

  const hmacHeader = req.headers.get('x-linkedstore-hmac-sha256') || ''
  if (!hmacHeader) return false

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
  const rawBody = await req.text()

  // Validação HMAC
  if (!await validarHMAC(req, rawBody)) {
    console.warn('[order-created] HMAC inválido')
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const body = JSON.parse(rawBody)

    if (body.event !== 'order/created') {
      return NextResponse.json({ ok: true })
    }

    const storeId = String(body.store_id || '')
    const orderId = String(body.id || '')
    const browserIp = body.client_details?.browser_ip || null
    const noteExistente = body.note || ''

    // Se a nota já tem bt=, o tracker.js já funcionou (checkout clássico)
    if (noteExistente && noteExistente.includes('bt=')) {
      console.log('[order-created] nota já tem bt=, pulando')
      return NextResponse.json({ ok: true, motivo: 'ja_tem_bt' })
    }

    console.log('[order-created] pedido', orderId, 'store', storeId, 'ip', browserIp)

    const supabase = await createServiceClient()

    // Busca lojista pelo store_id
    const { data: lojista } = await supabase
      .from('lojistas')
      .select('id, nuvemshop_token')
      .eq('nuvemshop_store_id', storeId)
      .eq('ativo', true)
      .single()

    if (!lojista) {
      return NextResponse.json({ ok: false, erro: 'Lojista não encontrado' }, { status: 404 })
    }

    // Janela de atribuição: 30 dias
    const janela = new Date()
    janela.setDate(janela.getDate() - 30)

    // IDs de sessões já atribuídas (idempotência)
    const { data: vendasExistentes } = await supabase
      .from('vendas')
      .select('session_id')
      .not('session_id', 'is', null)

    const sessionsAtribuidas = new Set(vendasExistentes?.map(v => v.session_id) ?? [])

    let clique = null

    // ── 1. Match preciso por IP ───────────────────────────────────────────
    if (browserIp) {
      const { data: cliques } = await supabase
        .from('cliques')
        .select('id, session_id, afiliado_id, created_at')
        .eq('lojista_id', lojista.id)
        .eq('ip', browserIp)
        .gte('created_at', janela.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      clique = cliques?.find(c => !sessionsAtribuidas.has(c.session_id)) ?? null
      if (clique) console.log('[order-created] match por IP:', clique.session_id)
    }

    // ── 2. Fallback: clique mais recente não atribuído ───────────────────
    if (!clique) {
      const { data: cliques } = await supabase
        .from('cliques')
        .select('id, session_id, afiliado_id, created_at')
        .eq('lojista_id', lojista.id)
        .gte('created_at', janela.toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      clique = cliques?.find(c => !sessionsAtribuidas.has(c.session_id)) ?? null
      if (clique) console.log('[order-created] fallback clique mais recente:', clique.session_id)
    }

    if (!clique) {
      console.log('[order-created] nenhum clique encontrado para atribuição')
      return NextResponse.json({ ok: true, motivo: 'sem_clique' })
    }

    // ── 3. Injeta bt=SESSION_ID na nota do pedido via API ────────────────
    const nota = noteExistente
      ? `${noteExistente} | bt=${clique.session_id}`
      : `bt=${clique.session_id}`

    await atualizarNotaPedido(lojista.nuvemshop_token, storeId, orderId, nota)

    console.log('[order-created] nota injetada no pedido', orderId, ':', nota)
    return NextResponse.json({ ok: true, sessionId: clique.session_id, metodo: browserIp ? 'ip' : 'fallback' })

  } catch (err) {
    console.error('[order-created] erro:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
