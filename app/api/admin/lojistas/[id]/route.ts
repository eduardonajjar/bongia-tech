import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function isAdmin(email: string | undefined) {
  return email === process.env.ADMIN_EMAIL
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
  }

  const service = await createServiceClient()

  const [
    { data: lojista },
    { count: totalAfiliados },
    { data: vendas },
    { data: pagamentos },
  ] = await Promise.all([
    service.from('lojistas').select('*').eq('id', id).single(),
    service.from('afiliados').select('*', { count: 'exact', head: true }).eq('lojista_id', id),
    service.from('vendas').select('valor_pedido, valor_comissao, status, criado_em').eq('lojista_id', id),
    service
      .from('pagamentos')
      .select('id, total_pago, taxa_plataforma, afiliados_pagos, status, criado_em')
      .eq('lojista_id', id)
      .order('criado_em', { ascending: false })
      .limit(20),
  ])

  const volumeTotal = (vendas || []).reduce((s: number, v: { valor_comissao: number }) => s + v.valor_comissao, 0)
  const pedidoTotal = (vendas || []).reduce((s: number, v: { valor_pedido: number }) => s + v.valor_pedido, 0)
  const taxaTotal = (pagamentos || []).reduce((s: number, p: { taxa_plataforma: number }) => s + p.taxa_plataforma, 0)

  return NextResponse.json({
    lojista,
    metricas: {
      totalAfiliados: totalAfiliados || 0,
      totalVendas: (vendas || []).length,
      volumeTotal,
      pedidoTotal,
      taxaTotal,
    },
    pagamentos: pagamentos || [],
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.json()
  const service = await createServiceClient()

  const updates: Record<string, unknown> = {}
  if (body.plano !== undefined) updates.plano = body.plano
  if (body.trial_ate !== undefined) updates.trial_ate = body.trial_ate
  if (body.ativo !== undefined) updates.ativo = body.ativo

  const { error } = await service.from('lojistas').update(updates).eq('id', id)
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
